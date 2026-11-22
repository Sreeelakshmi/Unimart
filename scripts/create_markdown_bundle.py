# scripts/create_markdown_bundle.py
import os
import shutil
import zipfile

SOURCE_MD = '/Users/sreelakshmi/.gemini/antigravity/brain/a1db2eb2-12ea-4f5e-87d9-f9efa4659296/sdf-assignment-report.md'
UML_DIR = '/Users/sreelakshmi/Desktop/Unimart/docs/uml_diagrams'
DOCS_IMG_DIR = '/Users/sreelakshmi/Desktop/Unimart/docs/images'
SCREENSHOT_DIR = '/Users/sreelakshmi/Desktop/Unimart/docs/screenshots'

TARGETS = [
    ('/Users/sreelakshmi/Downloads', 'SDF_Campus_Marketplace_Assignment.md'),
    ('/Users/sreelakshmi/Desktop', 'SDF_Campus_Marketplace_Assignment.md'),
    ('/Users/sreelakshmi/Desktop/Unimart/docs', 'SDF_Campus_Marketplace_Assignment.md'),
]

# Read original MD
with open(SOURCE_MD, 'r', encoding='utf-8') as f:
    content = f.read()

# Enhance Section 7 with both Dia Use Cases and Unified Model image
old_sec7 = "### 7.1 Comprehensive System Use Case Diagram"
enhanced_sec7 = """### 7.1 Comprehensive System Use Case Diagram (Dia Architecture & Mermaid)

#### Core Subsystem Use Case Diagrams (Dia-Style UML):

| Requirement | Diagram Description | Diagram Preview |
| :--- | :--- | :--- |
| **FR-01** | User Authentication & OTP Verification | ![FR-01 Use Case](images/image1.png) |
| **FR-06** | Product Listing Creation & AI Suggestions | ![FR-06 Use Case](images/image6.png) |
| **FR-10** | In-App Buyer-Seller Messaging | ![FR-10 Use Case](images/image10.png) |
| **FR-12** | Safe Campus Meetup Hub Selection | ![FR-12 Use Case](images/image12.png) |
| **FR-13** | Digital UPI Payments & Escrow | ![FR-13 Use Case](images/image13.png) |

#### Unified System Boundary Model (Mermaid & Standalone High-Res PNG):
![Figure 7.5: Unified Subsystem Boundary Architecture Model](images/system_usecase_diagram.png)
*Figure 7.5: Complete UML Subsystem Boundary Model covering all 16 Functional Requirements (FR-01 to FR-16).*
"""
if old_sec7 in content:
    content = content.replace(old_sec7, enhanced_sec7)

# Enhance Section 8 Sequence Diagram with standalone image
old_sec8 = "### End-to-End Order Placement, Payment & Safe Meetup Scheduling"
enhanced_sec8 = """### End-to-End Order Placement, Payment & Safe Meetup Scheduling

![Figure 8.1: UML Sequence Diagram — Order Placement, Payment & Safe Meetup](images/sequence_diagram.png)
*Figure 8.1: Complete 10-step sequence diagram illustrating interactions between Buyer, Mobile UI, Express API, Neon PostgreSQL, UPI Escrow, and Seller.*
"""
if old_sec8 in content:
    content = content.replace(old_sec8, enhanced_sec8)

# Enhance Section 9 State Machine Diagrams with standalone images
old_sec9_prod = "### 9.1 Product Listing Lifecycle (FR-06, FR-07, FR-08)"
enhanced_sec9_prod = """### 9.1 Product Listing Lifecycle (FR-06, FR-07, FR-08)

![Figure 9.1: UML State Machine Diagram — Product Listing Lifecycle](images/state_machine_product.png)
*Figure 9.1: Lifecycle state transitions for marketplace items from Draft, AI Screening, Active, to Reserved and Sold.*
"""
if old_sec9_prod in content:
    content = content.replace(old_sec9_prod, enhanced_sec9_prod)

old_sec9_order = "### 9.2 Order Lifecycle (FR-13, FR-14, FR-15)"
enhanced_sec9_order = """### 9.2 Order Lifecycle (FR-13, FR-14, FR-15)

![Figure 9.2: UML State Machine Diagram — Order Escrow Lifecycle](images/state_machine_order.png)
*Figure 9.2: State transitions for campus trade escrow from Initiation, Escrow Hold, Meetup, to Delivery Completion or Dispute.*
"""
if old_sec9_order in content:
    content = content.replace(old_sec9_order, enhanced_sec9_order)

# Enhance Section 10 Activity Diagram with standalone image
old_sec10 = "### Campus Trade Workflow (Discovery to Completion)"
enhanced_sec10 = """### Campus Trade Workflow (Discovery to Completion)

![Figure 10.1: UML Activity Diagram — Complete Campus Trade Workflow](images/activity_diagram.png)
*Figure 10.1: Swimlane activity flowchart covering Buyer discovery, checkout, safe meetup inspection, and escrow release.*
"""
if old_sec10 in content:
    content = content.replace(old_sec10, enhanced_sec10)

# Enhance Section 11 Class Diagram with standalone image
old_sec11 = "# 11. Class Diagram"
enhanced_sec11 = """# 11. Class Diagram

![Figure 11.1: UML Class Diagram — Domain Entities and Multiplicities](images/class_diagram.png)
*Figure 11.1: Complete Object-Oriented Domain Model showing User, Product, Order, CampusMeetupLocation, Message, VerificationLog, and CommunityReport with full attribute visibility (+/-) and methods.*
"""
if old_sec11 in content:
    content = content.replace(old_sec11, enhanced_sec11)

# Enhance Section 12 with direct screenshot embed
old_sec12 = "- **Execution Target**: Compiled Hermes native bytecode APK running smoothly on physical Android device (`Vivo V2506`)."
enhanced_sec12 = """- **Execution Target**: Compiled Hermes native bytecode APK running smoothly on physical Android device (`Vivo V2506`).

### Physical Device Verification:
![Figure 12.1: Unimart Home Feed & Claymorphism Navigation on Physical Android Phone](images/screenshot_home.png)
*Figure 12.1: Live execution on physical Vivo V2506 smartphone demonstrating category chips, pastel clay cards, and visible bottom navigation bar.*
"""
if old_sec12 in content:
    content = content.replace(old_sec12, enhanced_sec12)

# Copy to targets
for base_dir, filename in TARGETS:
    os.makedirs(base_dir, exist_ok=True)
    out_file = os.path.join(base_dir, filename)
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Written: {out_file}")

    # Copy images folder next to it
    img_dest = os.path.join(base_dir, 'images')
    os.makedirs(img_dest, exist_ok=True)
    
    # Copy all 16 UML Dia images
    for i in range(1, 17):
        src_img = os.path.join(UML_DIR, f"image{i}.png")
        if os.path.exists(src_img):
            shutil.copy2(src_img, os.path.join(img_dest, f"image{i}.png"))
            
    # Copy newly generated UML diagrams
    new_diagrams = [
        "system_usecase_diagram.png",
        "sequence_diagram.png",
        "state_machine_product.png",
        "state_machine_order.png",
        "activity_diagram.png",
        "class_diagram.png"
    ]
    for nd in new_diagrams:
        src_nd = os.path.join(DOCS_IMG_DIR, nd)
        dst_nd = os.path.join(img_dest, nd)
        if os.path.exists(src_nd) and os.path.abspath(src_nd) != os.path.abspath(dst_nd):
            shutil.copy2(src_nd, dst_nd)

    # Copy screenshots
    scr_home = os.path.join(SCREENSHOT_DIR, "screenshot_home.png")
    if os.path.exists(scr_home):
        shutil.copy2(scr_home, os.path.join(img_dest, "screenshot_home.png"))
        
    print(f"Copied {len(os.listdir(img_dest))} images to {img_dest}")

# Create a single portable ZIP archive in Downloads
zip_path = '/Users/sreelakshmi/Downloads/SDF_Campus_Marketplace_Assignment_Markdown_Bundle.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipf.write(os.path.join('/Users/sreelakshmi/Downloads', 'SDF_Campus_Marketplace_Assignment.md'), 'SDF_Campus_Marketplace_Assignment.md')
    img_src = '/Users/sreelakshmi/Downloads/images'
    for f in sorted(os.listdir(img_src)):
        zipf.write(os.path.join(img_src, f), os.path.join('images', f))

print(f"ZIP Bundle created at: {zip_path} (size: {os.path.getsize(zip_path):,} bytes)")
