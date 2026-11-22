import os
import urllib.request
import base64
import json
import time

DIAGRAMS = {
    "system_usecase_diagram.png": """flowchart LR
    subgraph Actors_Left["Primary Actors"]
        Student["Student (User)"]
        Buyer["Buyer"]
        Seller["Seller"]
    end

    subgraph System_Boundary["«Subsystem» Campus Marketplace (Unimart)"]
        direction TB
        subgraph Auth_Module["1. Identity & Profile"]
            UC1(["FR-01: Sign Up / Sign In (Clerk @msrit.edu)"])
            UC2(["FR-02: Manage Profile & Verification Badge"])
            UC3(["FR-03: Safety Guidelines & Onboarding"])
        end

        subgraph Browse_Module["2. Discovery & Search"]
            UC4(["FR-04: Browse Marketplace Feed & Filter"])
            UC5(["FR-05: Wishlist / Save Items"])
            UC11(["FR-11: Filter by Department & Campus Building"])
        end

        subgraph Listing_Module["3. Selling & Catalog"]
            UC6(["FR-06: Create Product Listing"])
            UC7(["FR-07: Automated AI Title & Condition Screening"])
            UC8(["FR-08: Manage Active Listings (Edit/Delete/Mark Sold)"])
        end

        subgraph Chat_Module["4. In-App Messaging"]
            UC9(["FR-09: Direct Buyer-Seller Chat"])
            UC10(["FR-10: Send Meetup Negotiation Presets"])
        end

        subgraph Fulfillment_Module["5. Escrow & Safe Handover"]
            UC12(["FR-12: Select Verified Safe Campus Meetup Hub"])
            UC13(["FR-13: Digital UPI Escrow Payment"])
            UC14(["FR-14: In-Person Verification & Escrow Release"])
            UC15(["FR-15: Dispute Resolution & Return Request"])
        end

        subgraph Moderation_Module["6. Governance"]
            UC16(["FR-16: Flag Inappropriate Listing / Report User"])
        end
    end

    subgraph Actors_Right["External Systems & Staff"]
        ClerkAuth["Clerk Identity Service"]
        GeminiAI["Gemini AI Screening"]
        UPIGateway["UPI / Razorpay Escrow"]
        Moderator["Admin / Student Verifier"]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Buyer --> UC4
    Buyer --> UC5
    Buyer --> UC11
    Buyer --> UC9
    Buyer --> UC10
    Buyer --> UC12
    Buyer --> UC13
    Buyer --> UC14
    Buyer --> UC15
    Buyer --> UC16

    Seller --> UC6
    Seller --> UC8
    Seller --> UC9
    Seller --> UC10
    Seller --> UC12
    Seller --> UC14
    Seller --> UC16

    UC1 -.-> ClerkAuth
    UC7 -.-> GeminiAI
    UC13 -.-> UPIGateway
    UC14 -.-> UPIGateway
    UC15 -.-> Moderator
    UC16 -.-> Moderator
""",

    "sequence_diagram.png": """sequenceDiagram
    autonumber
    actor Buyer as Student (Buyer)
    participant UI as Unimart Mobile App
    participant API as Express API Server
    participant DB as Neon PostgreSQL
    participant Escrow as UPI Escrow Service
    actor Seller as Student (Seller)

    Buyer->>UI: Select item and tap 'Buy Now'
    UI->>API: POST /api/orders (listingId, buyerId)
    API->>DB: Check listing status == 'ACTIVE'
    DB-->>API: Listing available & lock row
    API->>UI: Return order draft & available Campus Hubs

    Buyer->>UI: Select Meetup Hub: 'Library Central Steps' & confirm
    UI->>API: POST /api/orders/{id}/checkout (hubId, paymentMethod: UPI)
    API->>Escrow: Create Payment Intent (INR ₹850)
    Escrow-->>API: Intent created, return payment token
    API-->>UI: Launch UPI Gateway Sheet

    Buyer->>Escrow: Complete UPI Payment
    Escrow-->>API: Webhook payment.captured (Funds Held in Escrow)
    API->>DB: Update order status to 'ESCROW_PAID', listing to 'RESERVED'
    API-->>Seller: Push notification: 'Item Ordered! Coordinate Handover'
    API-->>UI: Display order confirmed & Chat button

    Buyer->>UI: Open in-app chat with Seller
    UI->>Seller: Confirm meetup time: 'Today 3:30 PM at Library Steps'
    Note over Buyer,Seller: In-person physical handover & item inspection

    Buyer->>UI: Tap 'Confirm Item Received & Condition OK'
    UI->>API: POST /api/orders/{id}/release-escrow (confirmationCode)
    API->>Escrow: Transfer payout to Seller UPI VPA
    Escrow-->>API: Payout completed successfully
    API->>DB: Update order status to 'COMPLETED', listing to 'SOLD'
    API-->>UI: Success modal: 'Prompt for Seller Rating & Review'
    API-->>Seller: Payout notification received
""",

    "state_machine_product.png": """stateDiagram-v2
    [*] --> Draft : Seller enters details
    Draft --> PendingReview : Submit listing
    PendingReview --> AIScreening : Trigger AI Verification (FR-07)
    AIScreening --> ChangesRequested : Inappropriate or vague content detected
    ChangesRequested --> Draft : Seller updates title/photo
    AIScreening --> Active : Automated approval
    Active --> Reserved : Buyer locks order via Escrow (FR-13)
    Reserved --> Active : Buyer cancels / Payment timeout
    Reserved --> Sold : In-person handover completed (FR-14)
    Active --> Archived : Seller removes listing (FR-08)
    Active --> Suspended : Community report flagged (FR-16)
    Suspended --> Archived : Moderator confirms violation
    Suspended --> Active : Moderator clears flag
    Sold --> [*]
    Archived --> [*]
""",

    "state_machine_order.png": """stateDiagram-v2
    [*] --> Initiated : Buyer initiates checkout
    Initiated --> PaymentPending : Choose UPI payment
    PaymentPending --> Cancelled : Buyer aborts / timeout (15 min)
    PaymentPending --> Paid_Escrow : Payment verification confirmed
    Paid_Escrow --> MeetupScheduled : Safe campus hub & time selected
    MeetupScheduled --> InDispute : Buyer reports mismatch at inspection (FR-15)
    InDispute --> Refunded : Moderator approves return
    InDispute --> Paid_Escrow : Resolution reached / handover re-attempted
    MeetupScheduled --> Delivered : In-person inspection passed & OTP verified (FR-14)
    Delivered --> Completed : Escrow funds released to Seller
    Cancelled --> [*]
    Refunded --> [*]
    Completed --> [*]
""",

    "activity_diagram.png": """graph TD
    Start([Start]) --> Login[Student Signs in with College Email]
    Login --> Browse[Browse / Search Marketplace Feed]
    Browse --> Select[Select Product & View Details]
    Select --> Decision1{Add to Wishlist or Buy?}
    Decision1 -->|Wishlist| SaveWishlist[Save to Wishlist FR-05]
    SaveWishlist --> EndWishlist([Saved for Later])
    Decision1 -->|Buy Now| Checkout[Initiate Checkout FR-13]
    Checkout --> PickLocation[Select Safe Campus Meetup Hub FR-12]
    PickLocation --> SubmitPayment[Submit UPI Payment]
    SubmitPayment --> OpenChat[Open Order Chat Thread FR-10]
    OpenChat --> Coordinate[Coordinate Exchange with Seller]
    Coordinate --> PhysicalMeetup[Meet at Safe Campus Hub]
    PhysicalMeetup --> Decision2{Item Condition OK?}
    Decision2 -->|Yes| ConfirmReceipt[Confirm Handover & Complete Order FR-14]
    Decision2 -->|No| RaiseDispute[Submit Return Request FR-15]
    RaiseDispute --> VerifierReview[Moderator Review]
    ConfirmReceipt --> Complete([Trade Successfully Completed])
    VerifierReview --> Complete
""",

    "class_diagram.png": """classDiagram
    class User {
        +String id
        +String clerkId
        +String fullName
        +String email
        +String university
        +String role
        +Float rating
        +register()
        +updateProfile()
        +verifyStudentBadge()
    }

    class Product {
        +String id
        +String sellerId
        +String title
        +String description
        +Float price
        +String category
        +String condition
        +List~String~ imageUrls
        +String status
        +DateTime createdAt
        +createListing()
        +updateListing()
        +markSold()
        +archiveListing()
    }

    class Order {
        +String id
        +String listingId
        +String buyerId
        +String sellerId
        +Float amount
        +String status
        +String meetupLocationId
        +String paymentMethod
        +DateTime createdAt
        +initiateOrder()
        +holdEscrow()
        +releaseEscrow()
        +raiseDispute()
    }

    class CampusMeetupLocation {
        +String id
        +String name
        +String campusBuilding
        +String operatingHours
        +Boolean isMonitoredByCCTV
        +getAvailableLocations()
    }

    class Message {
        +String id
        +String senderId
        +String recipientId
        +String orderId
        +String content
        +DateTime sentAt
        +sendMessage()
    }

    class VerificationLog {
        +String id
        +String listingId
        +String modelName
        +Float confidenceScore
        +Boolean passed
        +DateTime evaluatedAt
    }

    class CommunityReport {
        +String id
        +String reporterId
        +String targetListingId
        +String targetUserId
        +String reason
        +String status
        +DateTime filedAt
        +reviewReport()
    }

    User "1" --> "0..*" Product : "lists as Seller"
    User "1" --> "0..*" Order : "places as Buyer"
    Product "1" <-- "1" Order : "purchases"
    Order "0..*" --> "1" CampusMeetupLocation : "scheduled at"
    User "1" --> "0..*" Message : "sends"
    Order "1" --> "0..*" Message : "scoped to chat"
    Product "1" --> "0..*" VerificationLog : "evaluated by"
    User "1" --> "0..*" CommunityReport : "files"
    CommunityReport "0..*" --> "0..1" Product : "reports"
"""
}

OUTPUT_DIRS = [
    "/Users/sreelakshmi/Desktop/Unimart/docs/images",
    "/Users/sreelakshmi/Downloads/images",
    "/Users/sreelakshmi/Desktop/images",
    "/Users/sreelakshmi/.gemini/antigravity/brain/a1db2eb2-12ea-4f5e-87d9-f9efa4659296/images"
]

for d in OUTPUT_DIRS:
    os.makedirs(d, exist_ok=True)

print(f"Generating {len(DIAGRAMS)} UML diagrams...")
results = {}

for filename, code in DIAGRAMS.items():
    print(f"Fetching {filename}...")
    payload = {"code": code, "mermaid": {"theme": "default"}}
    b64_json = base64.b64encode(json.dumps(payload).encode("utf-8")).decode("ascii")
    url = f"https://mermaid.ink/img/{b64_json}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    
    success = False
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
                for d in OUTPUT_DIRS:
                    target_path = os.path.join(d, filename)
                    with open(target_path, "wb") as f:
                        f.write(data)
                print(f"  -> SUCCESS {filename} ({len(data)} bytes) saved to all {len(OUTPUT_DIRS)} directories.")
                results[filename] = len(data)
                success = True
                break
        except Exception as e:
            print(f"  -> Attempt {attempt+1} failed: {e}")
            time.sleep(2)
            
    if not success:
        print(f"  -> FAILED {filename} after 3 attempts.")

print("\n--- Summary of Generated Diagrams ---")
for fn, size in results.items():
    print(f"  - {fn}: {size:,} bytes")

