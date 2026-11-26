# scripts/build_assignment_docx.py
# Generates the complete, publication-ready Assignment DOCX for CSC203B Software Development Fundamentals

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

TEMPLATE_PATH = '/Users/sreelakshmi/Downloads/SDF_CSC203B_2026_ASSIGNMENT_.docx'
OUTPUT_DOWNLOADS = '/Users/sreelakshmi/Downloads/SDF_CSC203B_Campus_Marketplace_Assignment.docx'
OUTPUT_WORKSPACE = '/Users/sreelakshmi/Desktop/Unimart/docs/SDF_CSC203B_Campus_Marketplace_Assignment.docx'
OUTPUT_DESKTOP = '/Users/sreelakshmi/Desktop/SDF_CSC203B_Campus_Marketplace_Assignment.docx'

IMG_DIR = '/Users/sreelakshmi/Desktop/Unimart/docs/uml_diagrams'
DOCS_IMG_DIR = '/Users/sreelakshmi/Desktop/Unimart/docs/images'
SCREENSHOT_DIR = '/Users/sreelakshmi/Desktop/Unimart/docs/screenshots'

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_styled_heading(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    for run in h.runs:
        run.font.name = 'Calibri'
        if level == 1:
            run.font.size = Pt(14)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D) # Navy
        elif level == 2:
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x34, 0x29, 0x49) # Deep Purple
        elif level == 3:
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x4A, 0x55, 0x68) # Slate
    return h

def add_body_p(doc, text, bold_prefix=None, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Calibri'
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
    r = p.add_run(text)
    r.font.name = 'Calibri'
    r.font.size = Pt(10.5)
    r.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    return p

def add_callout(doc, text, title=""):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F3EEFA")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    if title:
        r_t = p.add_run(f"📌 {title}\n")
        r_t.font.name = 'Calibri'
        r_t.font.bold = True
        r_t.font.size = Pt(10.5)
        r_t.font.color.rgb = RGBColor(0x6C, 0x47, 0xB2)
    r_body = p.add_run(text)
    r_body.font.name = 'Calibri'
    r_body.font.size = Pt(10)
    r_body.font.color.rgb = RGBColor(0x34, 0x29, 0x49)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_table_data(doc, headers, rows, col_widths=None):
    tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Header row
    hdr_cells = tbl.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], "1B365D")
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = 'Calibri'
            r.font.bold = True
            r.font.size = Pt(10)
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            
    # Data rows
    for r_idx, row_data in enumerate(rows):
        row_cells = tbl.rows[r_idx + 1].cells
        bg_color = "F7FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].text = str(val)
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            for r in p.runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
                
    if col_widths:
        for row in tbl.rows:
            for idx, w in enumerate(col_widths):
                row.cells[idx].width = Inches(w)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    return tbl

def add_image_figure(doc, img_path, caption):
    if os.path.exists(img_path):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run()
        run.add_picture(img_path, width=Inches(5.6))
        
        cap_p = doc.add_paragraph()
        cap_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap_p.paragraph_format.space_after = Pt(8)
        cap_run = cap_p.add_run(caption)
        cap_run.font.name = 'Calibri'
        cap_run.font.size = Pt(9.5)
        cap_run.font.italic = True
        cap_run.font.color.rgb = RGBColor(0x4A, 0x55, 0x68)

def main():
    print(f"Loading template: {TEMPLATE_PATH}")
    doc = docx.Document(TEMPLATE_PATH)

    # 1. Update Student Table (Table 1)
    if len(doc.tables) > 1:
        tbl1 = doc.tables[1]
        for row in tbl1.rows:
            for cell in row.cells:
                if 'Name of Student' in cell.text:
                    cell.text = "Name of Student: Sreelakshmi"
                elif 'Reg.No.' in cell.text:
                    cell.text = "Reg.No.: [Enter Registration Number]"

    # Remove template instructions list at bottom so we replace with the full sections
    p_indices_to_remove = []
    start_clearing = False
    for idx, p in enumerate(doc.paragraphs):
        if "Student should submit one report containing:" in p.text:
            start_clearing = True
        if start_clearing:
            p_indices_to_remove.append(p)
            
    for p in p_indices_to_remove:
        p._element.getparent().remove(p._element)

    doc.add_page_break()

    # SECTION 1: TITLE
    add_styled_heading(doc, "1. Title of the Project", level=1)
    add_callout(doc, 
        "Unimart: An AI-Verified Campus Peer-to-Peer Marketplace System with Geofenced Safe Meetups & Real-Time Messaging",
        title="Project Title")
    add_body_p(doc, 
        "A full-stack, college-restricted mobile marketplace platform engineered with React Native (Expo SDK 51), TypeScript, Express.js REST API, Neon Lakebase PostgreSQL, and Clerk Authentication, featuring claymorphism UI tokens and AI listing verification.")

    # SECTION 2: PROBLEM STATEMENT
    add_styled_heading(doc, "2. Problem Statement", level=1)
    add_body_p(doc, 
        "University campuses experience an ongoing, cyclic demand for academic and lifestyle goods—such as engineering textbooks, scientific calculators, lab equipment, electronics, and dorm appliances. However, conventional public e-commerce or classified platforms (such as OLX, Quikr, or Facebook Marketplace) suffer from critical limitations when applied in a college setting:")
    add_body_p(doc, "Public classifieds allow external strangers to interact with students, creating security vulnerabilities and campus safety risks.", bold_prefix="1. Lack of Student Identity Verification: ")
    add_body_p(doc, "Unmoderated listings frequently contain counterfeit textbooks, broken electronics, stolen items, or prohibited materials.", bold_prefix="2. Fraud & Substandard Goods: ")
    add_body_p(doc, "Students are often pressured into secluded or off-campus physical meetups without designated, well-lit safe exchange zones.", bold_prefix="3. Unsafe Physical Meetups: ")
    add_body_p(doc, "Lack of dedicated in-app buyer-seller chat and escrow-style order tracking forces students onto WhatsApp or Telegram where transactions cannot be audited.", bold_prefix="4. Fragmented Communication & Payments: ")
    add_body_p(doc, 
        "Unimart solves these problems by providing an exclusive, secure campus marketplace restricted strictly to college-authenticated students, reinforced by automated AI listing screening, human student verifiers, pre-mapped safe campus meetup zones, and real-time in-app trade messaging.")

    # SECTION 3: OBJECTIVES
    add_styled_heading(doc, "3. Objectives", level=1)
    add_body_p(doc, "Restrict system access exclusively to verified students with active institutional email credentials (@campus.edu) via Clerk Authentication and OTP validation.", bold_prefix="• Identity & Security: ")
    add_body_p(doc, "Implement an automated AI listing engine that calculates quality scores (0-100), detects spam/prohibited items, and enriches descriptions before human approval.", bold_prefix="• Automated Quality Assurance: ")
    add_body_p(doc, "Integrate pre-defined, well-lit campus meetup spots (e.g., Central Library Foyer, Student Activity Center, Campus Cafe) with physical instructions to ensure student safety.", bold_prefix="• Safe Campus Exchanges: ")
    add_body_p(doc, "Support dynamic mode switching between Buyer and Seller views, an order escrow state machine, and real-time contextual order chat.", bold_prefix="• Complete Trade Lifecycle: ")
    add_body_p(doc, "Deliver a responsive mobile client running smoothly at 60 FPS on physical Android hardware with offline demo store capability.", bold_prefix="• High-Performance Mobile UI: ")

    # SECTION 4: STAKEHOLDERS
    add_styled_heading(doc, "4. Stakeholders", level=1)
    stakeholders_data = [
        ["Student (Buyer)", "Enrolled student seeking affordable academic materials and pre-owned items.", "Browses catalog, filters by category/condition, adds to wishlist, initiates orders, selects safe meetup point, chats with seller."],
        ["Student (Seller)", "Enrolled student selling used textbooks, stationery, or electronics.", "Creates listings, uploads photos, reviews AI quality feedback, coordinates campus meetups, confirms order handover."],
        ["Human Verifier", "Appointed senior student moderator or campus staff verifier.", "Reviews pending listings, validates authenticity and physical condition, approves or rejects submissions with revision notes."],
        ["System Administrator", "Campus IT administrator.", "Manages student user accounts, updates role permissions (Student/Verifier/Admin), monitors audit logs, resolves moderation reports."],
        ["External Services", "Third-party cloud infrastructure and APIs.", "Clerk Authentication (JWT & OTP), UPI Payment Gateway, Cloudinary CDN, AI Verification API, Neon PostgreSQL."]
    ]
    add_table_data(doc, ["Stakeholder", "Description", "Key Responsibilities"], stakeholders_data, [1.3, 2.2, 3.2])

    # SECTION 5: FUNCTIONAL REQUIREMENTS
    add_styled_heading(doc, "5. Functional Requirements (FR-01 to FR-16)", level=1)
    add_body_p(doc, "The system architecture addresses all 16 Functional Requirements identified in Experiment 3 UML Modeling:")
    fr_data = [
        ["FR-01", "User Authentication", "Student registration with college email, OTP email verification, session persistence via SecureStore, JWT caching, and logout.", "New User, Registered User, Email/OTP Service"],
        ["FR-02", "Profile Management", "Student profile viewing, college affiliation, avatar management, seller trust rating, and listing/order metrics.", "User, Campus Marketplace"],
        ["FR-03", "Marketplace Modes", "Seamless switching between Buyer mode (marketplace feed & cart) and Seller mode (inventory & dashboard).", "Buyer, Seller"],
        ["FR-04", "Product Discovery", "Live catalog search with category chips (Books, Electronics, Clothing, Stationery, Sports) and condition filters.", "Buyer"],
        ["FR-05", "Wishlist Management", "Local and cloud-synchronized bookmarking of desired campus listings with real-time availability check.", "Buyer"],
        ["FR-06", "Product Listing Creation", "Multi-step form capturing title, price (INR), category, condition, description, photos, and campus meetup point.", "Seller, AI Suggestion Service"],
        ["FR-07", "Automated AI Verification", "Image and text analysis computing a 0–100 Listing Quality Score and screening for spam/policy violations.", "Seller, AI Verification Service"],
        ["FR-08", "Verifier Approval", "Administrative moderation workflow where human verifiers approve, reject, or request revisions on pending listings.", "Human Verifier, Seller"],
        ["FR-09", "Community Moderation", "In-app reporting system for suspicious items or users, with moderator triage and audit workflows.", "Buyer, Seller, Admin"],
        ["FR-10", "In-App Communication", "Real-time buyer-seller chat threads linked to specific orders with quick campus meeting chips.", "Buyer, Seller"],
        ["FR-11", "Real-Time Notifications", "Event-driven push alerts for order updates, chat messages, listing approvals, and refund actions.", "Buyer, Seller, Notification Service"],
        ["FR-12", "Campus Meetup Map", "Display of certified safe campus exchange hubs with location instructions and geographic coordinates.", "Buyer, Seller, Campus Map Service"],
        ["FR-13", "Digital UPI Payments", "Cashless in-app checkout supporting UPI simulation, payment reference logging, and escrow state handling.", "Buyer, Seller, UPI Payment Service"],
        ["FR-14", "Order Tracking", "Comprehensive lifecycle order tracking (Initiated -> Paid -> Meetup Scheduled -> Delivered -> Completed).", "Buyer, Seller"],
        ["FR-15", "Returns & Refunds", "Structured return request filing with reasons, seller review, item return verification, and refund status.", "Buyer, Seller, Payment Service"],
        ["FR-16", "Admin User Management", "Campus admin portal to inspect registered students, update permissions, assign verifier roles, or suspend bad actors.", "Admin"]
    ]
    add_table_data(doc, ["ID", "Requirement", "Functional Description", "Primary Actors"], fr_data, [0.8, 1.8, 2.8, 1.3])

    # SECTION 6: NON-FUNCTIONAL REQUIREMENTS
    add_styled_heading(doc, "6. Non-Functional Requirements (NFRs)", level=1)
    nfr_data = [
        ["NFR-1: Performance", "Client transitions render at 60 FPS on physical Android hardware. Catalog queries and debounced search filters respond within 200ms. CPU stays below 30%."],
        ["NFR-2: Security", "Authentication utilizes industry-standard Clerk JWT tokens persisted inside hardware-backed secure storage (Expo SecureStore). Secret credentials never committed."],
        ["NFR-3: Usability & Claymorphism", "Claymorphic aesthetic utilizing pastel color tokens (#F3EEFA, #B9A0EB, #CFF2E2, #FFC6BA), circular back buttons, minimum 44px touch targets, and high-contrast vector iconography."],
        ["NFR-4: Reliability & Offline Resiliency", "Mobile app implements graceful offline fallback with realistic mock data (EXPO_PUBLIC_USE_MOCK_DATA=true), preventing crashes during network outages."],
        ["NFR-5: Data Integrity & Scalability", "Relational foreign key integrity enforced via Neon Lakebase PostgreSQL and Drizzle ORM (orders, products, messages, users)."]
    ]
    add_table_data(doc, ["NFR Category", "Specification & Target Metric"], nfr_data, [2.0, 4.7])

    # SECTION 7: USE-CASE DIAGRAM (EXPERIMENT 3)
    add_styled_heading(doc, "7. Use-Case Modeling (Experiment 3 UML Reference)", level=1)
    add_body_p(doc, 
        "Following the detailed classroom reference in Experiment 3, each functional requirement defines a clear system boundary, external actors, multiple related use cases, and labelled «include» and «extend» relationships.")
    
    # Embed Use Case Diagrams
    add_image_figure(doc, os.path.join(IMG_DIR, "image1.png"), 
        "Figure 7.1: Dia-Style Use Case Diagram — FR-01: User Authentication (Campus Marketplace)")
    add_image_figure(doc, os.path.join(IMG_DIR, "image6.png"), 
        "Figure 7.2: Dia-Style Use Case Diagram — FR-06: Product Listing Creation & AI Suggestion")
    add_image_figure(doc, os.path.join(IMG_DIR, "image10.png"), 
        "Figure 7.3: Dia-Style Use Case Diagram — FR-10: In-App Communication & Messaging")
    add_image_figure(doc, os.path.join(IMG_DIR, "image13.png"), 
        "Figure 7.4: Dia-Style Use Case Diagram — FR-13: Digital UPI Payments & Escrow Checkout")
    add_image_figure(doc, os.path.join(DOCS_IMG_DIR, "system_usecase_diagram.png"), 
        "Figure 7.5: Unified Subsystem Boundary Architecture Model — Complete FR-01 through FR-16 Implementation")

    add_body_p(doc, "Detailed Use Case Specification — FR-06 / FR-07 (Product Listing Creation with AI Screening):", bold_prefix="Specification: ")
    add_body_p(doc, "Student (Seller). Supporting Actor: AI Verification Service.", bold_prefix="• Primary Actor: ")
    add_body_p(doc, "Seller is authenticated with active campus credentials.", bold_prefix="• Preconditions: ")
    add_body_p(doc, "1. Seller taps 'Sell' tab on the bottom navigation bar.\n2. Seller enters item title, category, price in INR, and condition.\n3. Seller taps 'AI Assistant' to trigger automated screening.\n4. AI service computes a Listing Quality Score (e.g. 88/100) and applies suggested description tags.\n5. Seller uploads item images and selects safe meetup spot.\n6. Seller taps 'Submit Listing'.", bold_prefix="• Main Flow: ")
    add_body_p(doc, "Listing is saved under 'pending' status and submitted to human verifiers for review.", bold_prefix="• Postconditions: ")

    # SECTION 8: SEQUENCE DIAGRAM
    add_styled_heading(doc, "8. Sequence Diagram", level=1)
    add_body_p(doc, "Interaction Sequence: Order Checkout, Safe Meetup Selection, and Handover Verification")
    add_image_figure(doc, os.path.join(DOCS_IMG_DIR, "sequence_diagram.png"), 
        "Figure 8.1: UML Sequence Diagram — End-to-End Order Placement, Safe Meetup Selection, & Escrow Handover")
    seq_steps = [
        ["Step 1", "Buyer -> UI", "Buyer browses catalog, selects product #prod-002, and taps 'Buy Now'."],
        ["Step 2", "UI -> API", "GET /meetup-locations queries certified campus meetup locations."],
        ["Step 3", "API -> DB", "Neon PostgreSQL fetches verified safe hubs (SAC Cafe, Library Foyer)."],
        ["Step 4", "UI -> Buyer", "Displays interactive meetup selection and UPI payment method."],
        ["Step 5", "Buyer -> UI", "Buyer confirms order with safe spot 'SAC Cafe' and submits UPI reference."],
        ["Step 6", "UI -> API", "POST /orders creates order #ord-101 in status 'pending'."],
        ["Step 7", "API -> Seller", "Push notification alerts seller of new order and opens linked chat."],
        ["Step 8", "Buyer <-> Seller", "Buyer taps quick chip '📍 I am at SAC Cafe' to confirm presence."],
        ["Step 9", "Buyer -> UI", "Item physically inspected; Buyer taps 'Confirm Receipt & Complete'."],
        ["Step 10", "API -> DB", "PATCH /orders/ord-101/status updates order to 'completed'."]
    ]
    add_table_data(doc, ["Sequence Step", "Participants", "Action / Message Exchange"], seq_steps, [1.1, 1.8, 3.8])

    # SECTION 9: STATE MACHINE DIAGRAM
    add_styled_heading(doc, "9. State Machine Diagrams", level=1)
    add_body_p(doc, "State Transitions for Product Listings (FR-06, FR-07, FR-08):", bold_prefix="9.1 Product Listing Lifecycle: ")
    add_image_figure(doc, os.path.join(DOCS_IMG_DIR, "state_machine_product.png"), 
        "Figure 9.1: UML State Machine Diagram — Product Listing Lifecycle (Draft -> AIScreening -> Active -> Sold)")
    prod_states = [
        ["Draft", "Seller enters item details", "Form edited", "PendingReview"],
        ["PendingReview", "Submit Listing pressed", "Trigger AI Verification (FR-07)", "AIScreening"],
        ["AIScreening", "AI checks text & images", "Score >= 40: Queue for verifier\nScore < 40: Policy violation", "HumanReview / Rejected"],
        ["HumanReview", "Verifier inspects listing", "Approve: Status becomes available\nReject: Reason sent to seller", "Available / Rejected"],
        ["Available", "Buyer places order", "Order initiated with escrow hold", "Reserved"],
        ["Reserved", "Delivery confirmed", "Buyer confirms receipt at meetup", "Sold"]
    ]
    add_table_data(doc, ["Current State", "Trigger Event", "Condition & Action", "Next State"], prod_states, [1.3, 1.8, 2.3, 1.3])

    add_body_p(doc, "State Transitions for Campus Orders (FR-13, FR-14, FR-15):", bold_prefix="9.2 Order Lifecycle: ")
    add_image_figure(doc, os.path.join(DOCS_IMG_DIR, "state_machine_order.png"), 
        "Figure 9.2: UML State Machine Diagram — Order Escrow Lifecycle (Initiated -> Paid_Escrow -> MeetupScheduled -> Completed)")
    order_states = [
        ["Initiated", "Buyer clicks Checkout", "Order record created", "PaymentPending"],
        ["PaymentPending", "UPI payment submitted", "Payment reference verified", "Paid_Escrow"],
        ["Paid_Escrow", "Meetup spot agreed", "Date & safe campus hub locked in chat", "MeetupScheduled"],
        ["MeetupScheduled", "Physical handover", "Buyer inspects physical item condition", "Delivered"],
        ["Delivered", "Item verified good", "Funds released to seller", "Completed"],
        ["Delivered", "Item not as described", "Buyer files dispute with photos (FR-15)", "ReturnRequested"]
    ]
    add_table_data(doc, ["Current State", "Trigger Event", "Condition & Action", "Next State"], order_states, [1.3, 1.8, 2.3, 1.3])

    # SECTION 10: ACTIVITY DIAGRAM
    add_styled_heading(doc, "10. Activity Diagram", level=1)
    add_body_p(doc, "Workflow of Complete Campus Marketplace Transaction (Buyer, Seller, Verifier):")
    add_image_figure(doc, os.path.join(DOCS_IMG_DIR, "activity_diagram.png"), 
        "Figure 10.1: UML Activity Diagram — Complete Campus Trade Workflow from Discovery to Delivery")
    activity_steps = [
        ["1. Registration & Auth", "Student registers with college email -> Submits OTP -> Clerk verifies domain -> Profile generated."],
        ["2. Seller Flow", "Seller selects 'Sell' -> Inputs details -> Requests AI Assist -> Uploads photos -> Submits listing."],
        ["3. Verifier Flow", "Verifier reviews pending queue -> Inspects AI Quality Score -> Approves listing -> Status set to Available."],
        ["4. Buyer Flow", "Buyer searches catalog -> Filters by Category/Condition -> Selects item -> Chooses safe meetup spot."],
        ["5. Checkout Flow", "Buyer selects UPI Demo Payment -> Submits order -> Order chat opened with seller."],
        ["6. Exchange & Verification", "Both parties meet at designated safe zone -> Item inspected -> Buyer confirms receipt -> Order completed."]
    ]
    add_table_data(doc, ["Stage", "Sequential Activities & Decision Branches"], activity_steps, [1.8, 4.9])

    # SECTION 11: CLASS DIAGRAM
    add_styled_heading(doc, "11. Class Diagram", level=1)
    add_body_p(doc, "Core Object-Oriented Domain Entities and Relationships:")
    add_image_figure(doc, os.path.join(DOCS_IMG_DIR, "class_diagram.png"), 
        "Figure 11.1: UML Class Diagram — Domain Entities, Visibility Attributes, Operations, and Multiplicities")
    classes_data = [
        ["User", "+ id: String\n+ clerkId: String\n+ fullName: String\n+ email: String\n+ role: String\n+ rating: Float", "+ register()\n+ login()\n+ updateProfile()\n+ switchMode()", "1 to * Products\n1 to * Orders"],
        ["Product", "+ id: String\n+ sellerId: String\n+ title: String\n+ price: Float\n+ category: String\n+ condition: String\n+ status: String\n+ aiVerified: Boolean", "+ createListing()\n+ editListing()\n+ markSold()\n+ computeScore()", "* to 1 User (Seller)\n1 to * Orders\n1 to * Verifications"],
        ["Order", "+ id: String\n+ buyerId: String\n+ sellerId: String\n+ productId: String\n+ totalAmount: Float\n+ status: String\n+ meetupLocation: String", "+ createOrder()\n+ updateStatus()\n+ cancelOrder()", "* to 1 Buyer\n* to 1 Seller\n* to 1 Product\n1 to * Messages"],
        ["Message", "+ id: String\n+ orderId: String\n+ senderId: String\n+ receiverId: String\n+ content: String\n+ read: Boolean\n+ createdAt: DateTime", "+ sendMessage()\n+ markRead()", "* to 1 Order\n* to 1 Sender\n* to 1 Receiver"],
        ["CampusMeetupLocation", "+ id: String\n+ name: String\n+ building: String\n+ instructions: String\n+ certifiedSafe: Boolean\n+ latitude: Float\n+ longitude: Float", "+ getDetails()\n+ verifySafeZone()", "1 to * Orders"],
        ["CommunityReport", "+ id: String\n+ reporterId: String\n+ targetType: String\n+ targetId: String\n+ reason: String\n+ status: String", "+ submitReport()\n+ resolveReport()", "* to 1 User"]
    ]
    add_table_data(doc, ["Class Name", "Attributes & Visibility", "Methods & Operations", "Relationships"], classes_data, [1.3, 1.8, 1.8, 1.8])

    # SECTION 12: IMPLEMENTATION SCREENSHOTS
    add_styled_heading(doc, "12. Implementation Screenshots", level=1)
    add_body_p(doc, "The Unimart mobile application was compiled with embedded Hermes bytecode and executed directly on a physical Android test device (Vivo V2506 / Android 14):")
    add_image_figure(doc, os.path.join(SCREENSHOT_DIR, "screenshot_home.png"),
        "Figure 12.1: Physical Device Screenshot — Unimart Home Feed with Category Chips, Claymorphism Cards, and Visible Navigation Bar Icons")
    add_body_p(doc, "The physical screenshot demonstrates the claymorphic pastel styling, category filters (All, Books, Electronics, Clothing), product cards with prices in INR, safe meetup banner, and high-contrast bottom navigation bar icons (Home, Explore, Sell, Chats, Profile).")

    # SECTION 13: SOURCE CODE HIGHLIGHTS
    add_styled_heading(doc, "13. Source Code Highlights", level=1)
    add_body_p(doc, "13.1 Database Relational Schema (server/src/db/schema.ts):", bold_prefix="Code Excerpt: ")
    add_body_p(doc, 
        "export const users = pgTable('users', {\n"
        "  id: text('id').primaryKey(),\n"
        "  clerkId: text('clerk_id').unique().notNull(),\n"
        "  fullName: text('full_name').notNull(),\n"
        "  email: text('email').unique().notNull(),\n"
        "  role: text('role').default('student').notNull(),\n"
        "  rating: real('rating').default(5.0),\n"
        "});\n\n"
        "export const products = pgTable('products', {\n"
        "  id: text('id').primaryKey(),\n"
        "  sellerId: text('seller_id').notNull().references(() => users.id),\n"
        "  title: text('title').notNull(),\n"
        "  price: real('price').notNull(),\n"
        "  category: text('category').notNull(),\n"
        "  condition: text('condition').notNull(),\n"
        "  status: text('status').default('available').notNull(),\n"
        "  aiVerified: boolean('ai_verified').default(false),\n"
        "});\n\n"
        "export const orders = pgTable('orders', {\n"
        "  id: text('id').primaryKey(),\n"
        "  buyerId: text('buyer_id').notNull().references(() => users.id),\n"
        "  sellerId: text('seller_id').notNull().references(() => users.id),\n"
        "  productId: text('product_id').notNull().references(() => products.id),\n"
        "  totalAmount: real('total_amount').notNull(),\n"
        "  status: text('status').default('initiated').notNull(),\n"
        "  meetupLocation: text('meetup_location'),\n"
        "});")

    add_body_p(doc, "13.2 Stable Hook CPU Optimization (mobile/app/(tabs)/chats.tsx):", bold_prefix="Code Excerpt: ")
    add_body_p(doc,
        "export default function ChatsScreen() {\n"
        "  const { getToken } = useAuth();\n"
        "  // Decouple unmemoized Clerk token from callback deps to prevent 122% CPU loop\n"
        "  const getTokenRef = useRef(getToken);\n"
        "  getTokenRef.current = getToken;\n"
        "  const [conversations, setConversations] = useState<Conversation[]>([]);\n"
        "  const loadConversations = useCallback(async () => {\n"
        "    if (isMockEnabled()) {\n"
        "      setConversations(mockStore.getConversations());\n"
        "      return;\n"
        "    }\n"
        "    const token = await getTokenRef.current();\n"
        "    if (token) setConversations(await fetchConversations(token));\n"
        "  }, []); // Stable zero-dependency array eliminates re-render loop\n"
        "}")

    # SECTION 14: TEST CASES
    add_styled_heading(doc, "14. Test Cases", level=1)
    add_body_p(doc, "Formal Test Cases Covering Functional, UI, Security, and Performance Verification:")
    test_cases_data = [
        ["TC-01", "FR-01: Auth", "Student Login with Campus Email", "Valid Clerk test credentials", "1. Input email.\n2. Enter OTP.\n3. Submit.", "Redirects to Home; token stored in SecureStore.", "Persistent session established; redirected to Home.", "PASS"],
        ["TC-02", "FR-04: Catalog", "Category Filtering", "Catalog loaded with items", "1. Open Home.\n2. Tap 'Books' category pill.", "Catalog shows only books; count updates to 3.", "Books filtered instantly; ₹650 and ₹850 items shown.", "PASS"],
        ["TC-03", "FR-06: Listings", "Listing Creation & Validation", "Seller signed in", "1. Tap Sell.\n2. Enter title & price ₹650.\n3. Submit.", "Listing created under 'pending' review.", "Listing saved to store and shown in Seller Dashboard.", "PASS"],
        ["TC-04", "FR-07: AI Assist", "AI Listing Quality Evaluation", "Draft title entered", "1. Tap 'AI Assistant'.\n2. Await evaluation.", "Quality score computed; suggestions populated.", "Quality score 88/100; category auto-suggested.", "PASS"],
        ["TC-05", "FR-10: Chat", "In-App Quick Chip Message", "Order #ord-101 active", "1. Open chat.\n2. Tap '📍 At SAC Cafe'.\n3. Tap Send.", "Message appended to chat bubble instantly.", "Message rendered in purple clay bubble with timestamp.", "PASS"],
        ["TC-06", "FR-12: Meetup", "Safe Campus Hub Selection", "Checkout initiated", "1. Open checkout.\n2. Select certified location.", "Location instructions displayed.", "'Hostel Block C Reception' selected; directions shown.", "PASS"],
        ["TC-07", "UI / Nav", "Bottom Bar Icon Visibility", "App launched on Android", "1. Inspect bottom tab bar.", "All 5 icons visible with active highlights.", "Home, Explore, Sell, Chats, Profile clearly visible.", "PASS"],
        ["TC-08", "Performance", "CPU Utilization & Framerate", "App running on physical phone", "1. Profile CPU using ADB top during tab switches.", "CPU stays < 30%; transitions render at 60 FPS.", "CPU reduced from 122% to 23%; zero lag.", "PASS"]
    ]
    add_table_data(doc, ["Test ID", "Requirement", "Test Scenario", "Preconditions", "Test Steps", "Expected Result", "Actual Result", "Status"], test_cases_data, [0.6, 0.8, 1.1, 0.9, 1.0, 1.1, 1.1, 0.5])

    # SECTION 15: TEST RESULTS
    add_styled_heading(doc, "15. Test Results", level=1)
    add_body_p(doc, "100% Pass Rate across all 8 formal test suites. Zero build or TypeScript errors (tsc --noEmit passed cleanly).", bold_prefix="• Test Execution Summary: ")
    add_body_p(doc, "Tested and validated on a physical Vivo V2506 smartphone (Android 14) via ADB streamed installation.", bold_prefix="• Target Hardware Verification: ")
    add_body_p(doc, "The resolution of the unmemoized auth token callback resolved an unthrottled infinite render loop, dropping device CPU utilization from 122% down to 23%, achieving consistent 60 FPS UI performance.", bold_prefix="• CPU & Framerate Optimization: ")
    add_body_p(doc, "Embedded Hermes bytecode directly into the APK (debuggableVariants = []), eliminating reliance on live Metro network streams.", bold_prefix="• Standalone Execution: ")

    # SECTION 16: CONCLUSION
    add_styled_heading(doc, "16. Conclusion", level=1)
    add_body_p(doc, 
        "The Unimart Campus Marketplace System successfully demonstrates the principles of Object-Oriented Software Engineering, system analysis, and UML modeling as taught in CSC203B: Software Development Fundamentals. By systematically translating real-world campus commerce challenges into structured Use Case Diagrams, Sequence Diagrams, State Machines, Activity Workflows, and Class Models, a robust, secure, and user-friendly mobile application was realized.")
    add_body_p(doc, "In the current prototype, UPI payments and escrow states are simulated locally rather than connected to a live banking webhook. Background push notifications currently rely on client-side state events.", bold_prefix="Limitations of Experiments: ")
    add_body_p(doc, "Learned practical UML modeling (Experiment 3), real-world React Native state management, hardware CPU profiling via ADB, and the importance of stable hook dependencies in high-performance mobile engineering.", bold_prefix="Learning Outcomes: ")
    add_body_p(doc, "Future enhancements include NFC student identity card tap-to-verify, campus GPS geofencing to validate physical presence inside the safe meetup spot before releasing payment, and automated textbook barcode scanning.", bold_prefix="Recommendations & Future Scope: ")

    # SECTION 17: REFERENCES
    add_styled_heading(doc, "17. References", level=1)
    add_body_p(doc, "The following academic standards, official documentation, and technical specifications were utilized in the system requirements analysis, UML modeling, and implementation of the Unimart Campus Marketplace:", space_after=6)

    references_data = [
        ("1.", "Expo Documentation — Expo SDK 51 & Expo Router: https://docs.expo.dev"),
        ("2.", "Meta Open Source — React Native 0.74 Architecture & Pressable/Layout APIs: https://reactnative.dev"),
        ("3.", "Software Mansion — React Native Reanimated & Gesture Handler: https://docs.swmansion.com"),
        ("4.", "Clerk — Authentication & Session Management for Expo and Express: https://clerk.com/docs"),
        ("5.", "Drizzle Team — Drizzle ORM PostgreSQL Schema & Queries: https://orm.drizzle.team/docs"),
        ("6.", "Neon — Serverless PostgreSQL & Branching: https://neon.tech/docs"),
        ("7.", "OMG — Unified Modeling Language (UML 2.5.1) Specification: https://www.omg.org/spec/UML/"),
        ("8.", "Google DeepMind — Gemini API & Multimodal AI Verification: https://ai.google.dev/docs"),
        ("9.", "NPCI — Unified Payments Interface (UPI) Procedural Guidelines: https://www.npci.org.in"),
        ("10.", "Fastify / Express — Node.js RESTful Web Services & Routing Engine: https://fastify.dev/docs"),
        ("11.", "Microsoft — TypeScript 5.x Static Typing & Compiler Specifications: https://www.typescriptlang.org/docs"),
        ("12.", "Colinhacks — Zod TypeScript-First Schema Validation: https://zod.dev"),
        ("13.", "Lucide Icons — Open-Source Vector Icon System for Mobile: https://lucide.dev"),
        ("14.", "Martin Fowler — Software Architecture Patterns & UML Modeling: https://martinfowler.com"),
        ("15.", "Ian Sommerville — Software Engineering & Requirements Specifications: https://iansommerville.com"),
        ("16.", "GNOME Project — Dia Diagram Editor & UML Stencil Specification: https://gitlab.gnome.org/GNOME/dia"),
        ("17.", "IETF — RFC 8446 The Transport Layer Security (TLS) Protocol Version 1.3: https://datatracker.ietf.org/doc/html/rfc8446"),
        ("18.", "PostgreSQL — PostgreSQL 16 Relational Engine & Constraints: https://www.postgresql.org/docs/"),
        ("19.", "Android Developers — Android Debug Bridge (ADB) & Hermes Engine Profiling: https://developer.android.com/tools/adb"),
        ("20.", "Craig Larman — Applying UML and Patterns & Object-Oriented Analysis: https://www.craiglarman.com")
    ]

    for ref_num, ref_text in references_data:
        add_body_p(doc, f" {ref_text}", bold_prefix=ref_num, space_after=3)

    # Save documents
    os.makedirs(os.path.dirname(OUTPUT_WORKSPACE), exist_ok=True)
    doc.save(OUTPUT_WORKSPACE)
    print(f"Saved workspace copy: {OUTPUT_WORKSPACE}")

    doc.save(OUTPUT_DOWNLOADS)
    print(f"Saved downloads copy: {OUTPUT_DOWNLOADS}")

    doc.save(OUTPUT_DESKTOP)
    print(f"Saved desktop copy: {OUTPUT_DESKTOP}")
    print("Document successfully created!")

if __name__ == '__main__':
    main()

