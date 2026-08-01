from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = [
    ROOT / "output" / "pdf" / "Ali-Mohammadi-Backend-Engineer-Resume.pdf",
    ROOT / "public" / "Ali-Mohammadi-Backend-Engineer-Resume.pdf",
]

INK = HexColor("#10110d")
LIME = HexColor("#667900")
MUTED = HexColor("#595b54")
LINE = HexColor("#b7b5aa")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Name", fontName="Helvetica-Bold", fontSize=28, leading=28, textColor=INK, spaceAfter=3))
styles.add(ParagraphStyle(name="Role", fontName="Helvetica", fontSize=15, leading=19, textColor=LIME, spaceAfter=12))
styles.add(ParagraphStyle(name="Meta", fontName="Courier", fontSize=7.5, leading=11, textColor=MUTED))
styles.add(ParagraphStyle(name="Section", fontName="Courier-Bold", fontSize=8, leading=11, textColor=LIME, spaceBefore=12, spaceAfter=8))
styles.add(ParagraphStyle(name="Heading", fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=INK, spaceAfter=2))
styles.add(ParagraphStyle(name="Body", fontName="Helvetica", fontSize=9, leading=13, textColor=MUTED, spaceAfter=5))
styles.add(ParagraphStyle(name="Small", fontName="Courier", fontSize=7.2, leading=10, textColor=MUTED))

roles = [
    ("2025-NOW", "Senior Backend Engineer - QCode", "Leading backend architecture across product domains; designing APIs, data paths, integrations, and reliable operating boundaries."),
    ("2024-NOW", "Founder - Code Gap", "Building a developer community around practical engineering, collaborative projects, mentoring, and educational events."),
    ("2023-NOW", "Freelance Web Developer - Independent", "Delivering maintainable backend systems for product teams, including investment and commerce platforms."),
    ("2019-2025", "Backend Developer to Team Lead - Alborz Institute", "Progressed from implementation into technical leadership, CRM delivery, developer mentoring, and full-stack teaching."),
]

projects = [
    ("Django Store", "Commerce API with explicit service boundaries, database constraints, and a versioned Django REST interface."),
    ("Ecostore", "Maintainable commerce platform with transactional order workflows and bounded asynchronous processing."),
    ("Code Gap", "Community and event platform supporting education, collaboration, and repeatable operational workflows."),
]

def build_story():
    story = [
        Paragraph("ALI MOHAMMADI", styles["Name"]),
        Paragraph("Backend Engineer", styles["Role"]),
        Paragraph("BAKU  |  alimohammadi.8773@gmail.com  |  github.com/AliDvlpr  |  linkedin.com/in/alidvlpr", styles["Meta"]),
        Spacer(1, 5 * mm),
        HRFlowable(width="100%", color=INK, thickness=1.2),
        Paragraph("PROFILE", styles["Section"]),
        Paragraph("Backend engineer with 5+ years of experience turning complex product requirements into dependable systems. Focused on API architecture, data design, caching, background processing, performance, and clear operational boundaries.", styles["Body"]),
        Paragraph("EXPERIENCE", styles["Section"]),
    ]
    for period, title, detail in roles:
        row = Table([[Paragraph(period, styles["Small"]), [Paragraph(title, styles["Heading"]), Paragraph(detail, styles["Body"])]]], colWidths=[30 * mm, 142 * mm])
        row.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE), ("BOTTOMPADDING", (0, 0), (-1, -1), 7), ("TOPPADDING", (0, 0), (-1, -1), 7)]))
        story.append(row)
    story += [Paragraph("SELECTED PROJECTS", styles["Section"])]
    for title, detail in projects:
        story += [Paragraph(title, styles["Heading"]), Paragraph(detail, styles["Body"])]
    skills = [
        [Paragraph("CORE BACKEND", styles["Small"]), Paragraph("Python, FastAPI, Django, Django REST Framework, Go", styles["Body"])],
        [Paragraph("DATA", styles["Small"]), Paragraph("PostgreSQL, Redis, relational modeling, caching, rate limiting", styles["Body"])],
        [Paragraph("DELIVERY", styles["Small"]), Paragraph("Docker, Cloudflare, structured logging, testing, CI workflows", styles["Body"])],
        [Paragraph("LEADERSHIP", styles["Small"]), Paragraph("Architecture, mentoring, technical planning, product collaboration", styles["Body"])],
    ]
    story += [Paragraph("SKILLS", styles["Section"])]
    table = Table(skills, colWidths=[35 * mm, 137 * mm])
    table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    story.append(table)
    return story

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Courier", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm, "ALIDVLPR / BACKEND ENGINEER")
    canvas.drawRightString(190 * mm, 12 * mm, f"PAGE {doc.page}")
    canvas.restoreState()

for output in OUTPUTS:
    output.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(str(output), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm, title="Ali Mohammadi - Backend Engineer Resume", author="Ali Mohammadi")
    document.build(build_story(), onFirstPage=footer, onLaterPages=footer)
