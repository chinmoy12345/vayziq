from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

OUT = r"H:\NEXTJS\vayziq\output\pdf\Vayziq_Banner_Source_Guide.pdf"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="DocTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=23, leading=27, textColor=colors.black, alignment=TA_LEFT, spaceAfter=13))
styles.add(ParagraphStyle(name="H1x", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=colors.black, spaceBefore=11, spaceAfter=7, keepWithNext=True))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=colors.black, spaceBefore=8, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.2, leading=13.2, textColor=colors.HexColor("#262626"), spaceAfter=5))
styles.add(ParagraphStyle(name="Bulletx", parent=styles["BodyText"], fontName="Helvetica", fontSize=9, leading=12.6, leftIndent=12, firstLineIndent=-7, bulletIndent=3, textColor=colors.HexColor("#262626"), spaceAfter=4))
styles.add(ParagraphStyle(name="TableHeader", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=7.5, leading=9.5, textColor=colors.white, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="TableCell", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.4, leading=9.8, textColor=colors.HexColor("#222222")))
styles.add(ParagraphStyle(name="TableCellBold", parent=styles["TableCell"], fontName="Helvetica-Bold"))
styles.add(ParagraphStyle(name="Footer", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.5, textColor=colors.HexColor("#777777"), alignment=TA_CENTER))

def P(text, style="Bodyx"):
    return Paragraph(text, styles[style])

def bullet(text):
    return Paragraph("&#8226; " + text, styles["Bulletx"])

def banner_table(headers, rows, widths):
    data = [[P(h, "TableHeader") for h in headers]]
    for row in rows:
        data.append([P(v, "TableCellBold" if i == 0 else "TableCell") for i, v in enumerate(row)])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="CENTER")
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#252525")),
        ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#D9D9D9")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    for r in range(2, len(data), 2):
        style.append(("BACKGROUND", (0, r), (-1, r), colors.HexColor("#F7F7F7")))
    table.setStyle(TableStyle(style))
    return table

def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#E0E0E0"))
    canvas.setLineWidth(0.4)
    canvas.line(18 * mm, 13 * mm, 192 * mm, 13 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#777777"))
    canvas.drawString(18 * mm, 8.5 * mm, "Vayziq storefront banner architecture")
    canvas.drawRightString(192 * mm, 8.5 * mm, f"Page {doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(OUT, pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=17*mm, bottomMargin=18*mm, title="Vayziq Banner Source Guide", author="Vayziq")
story = []
story.append(P("Vayziq Banner Source Guide", "DocTitle"))
story.append(P("<b>Purpose</b>  This guide shows where each storefront banner comes from, which Admin placement controls it, and which code fallback appears when no active database banner exists."))
story.append(P("<b>Main conclusion</b>  Home, Offer Zone, Shop, Search and category collection banners can be managed from Admin Banners. About, Contact, legal pages and the Offers listing hero are currently code based and require a code or asset change."))

story.append(P("Banner management flow", "H1x"))
for text in [
    "Open Admin Banners at <b>/admin/banners</b> and choose Add Banner or edit an existing banner.",
    "Choose a Placement. Available placements are Home slider, Home Offer Zone, Shop slider, Search results slider and one slider placement for every active category.",
    "Upload a JPG, PNG or WebP image up to 2 MB. The editor recommends 1600 x 600 pixels for sliders and 1000 x 400 pixels for Offer Zone cards.",
    "Set Position, destination link and Enabled status. Lower Position values appear first.",
    "The Banner database table stores image, title, subtitle, link, placement, active state and sort order. Storefront queries only active records.",
]: story.append(bullet(text))

story.append(P("Admin managed banner sources", "H1x"))
story.append(banner_table(
    ["Storefront area", "Placement", "Source and priority", "Fallback"],
    [
        ("Home hero slider", "home", "Banner table through getVayziqHomeData. Active banners are sorted by sortOrder then createdAt. Up to 8 are loaded.", "Four images under public/vayziq including hero paired, women, men and fashion grid."),
        ("Home editorial offer strips", "offer-zone", "The first two active Offer Zone banner records are used by VayziqHome as the two existing offer strips.", "Women and men category images with built in offer copy."),
        ("Home coupon Offer Zone", "Not a Banner placement", "Coupon table through getVayziqHomeData. Only active, currently valid and usage available coupons are shown.", "No coupon cards if there are no eligible coupons."),
        ("Shop page banner", "shop", "CollectionPage calls getActiveBanner and displays the first active banner.", "public/vayziq/hero-paired-v2.png with the Move freely message."),
        ("Search results banner", "search", "The Search results placement is supported by the Banner system and editor.", "Page specific search presentation when no managed banner is supplied."),
        ("Category page banner", "category:{slug}", "Each active category gets its own placement, for example category:men. CollectionPage loads the first active banner.", "Code chooses an image from public/vayziq based on category name and slug."),
        ("Offer editorial cards", "offer-zone", "The OfferZone component calls getActiveBanners for all active Offer Zone records.", "Two demo offer cards use images under public/uploads/banners."),
    ],
    [32*mm, 25*mm, 67*mm, 50*mm]
))

story.append(PageBreak())
story.append(P("Code based page banners", "H1x"))
story.append(banner_table(
    ["Page or feature", "Component", "Current source", "How to change"],
    [
        ("About page", "VayziqPageBanner", "public/vayziq/hero-paired-v2.png passed directly by the page.", "Change the image prop in app/(store)/about/page.tsx or make the component database driven."),
        ("Contact page", "VayziqPageBanner", "public/vayziq/category-women.png passed directly by the page.", "Change the image prop in app/(store)/contact/page.tsx."),
        ("Legal pages", "LegalPageLayout and VayziqPageBanner", "Default public/vayziq/hero-paired-v2.png from VayziqPageBanner.", "Change the default image in VayziqPageBanner or add page specific image props."),
        ("Offers listing page", "OffersPage", "The compact black and yellow hero is built with CSS and text in app/(store)/offers/page.tsx. It does not use the Banner table.", "Edit the offers page hero or add a new Admin placement."),
        ("Individual offer page", "PageBanner", "Coupon based promo slide or an active offer-zone Banner record selected by numeric banner id.", "Edit promo slide generation or the linked Offer Zone banner in Admin."),
        ("BannerSlider default", "BannerSlider", "public/vayziq/hero-paired-v2.png is used when a slide has no image.", "Supply a slide image or change the default in BannerSlider."),
        ("Watch and Buy posters", "WatchAndBuy", "Reel poster uploaded or selected in Admin Reels. Historical examples use home-saree-editorial.png.", "Manage through Admin Reels. These are reel posters, not Banner records."),
    ],
    [31*mm, 36*mm, 61*mm, 46*mm]
))

story.append(P("Important distinction", "H1x"))
story.append(P("<b>Offer banners and coupon cards are different data.</b> The two image based offer strips use Banner records with placement <b>offer-zone</b>. The new coupon style Offers Zone uses Coupon records and derives its heading, condition, description and code from the coupon configuration. Removing or changing a Banner does not remove a Coupon, and changing a Coupon does not replace the editorial banner images."))

story.append(PageBreak())
story.append(P("Source files", "H1x"))
sources = [
    ("lib/vayziq-home-data.ts", "Home hero banners, first two Offer Zone banners, coupon cards and fallbacks."),
    ("components/home/VayziqHome.tsx", "Home placement and rendering of hero, editorial offer strips and coupon Offer Zone."),
    ("components/home/OfferZone.module.css", "Visual design for the coupon Offer Zone."),
    ("lib/storefront.ts", "Banner placement types and active banner database queries."),
    ("components/admin/BannerEditor.tsx", "Admin placement choices, upload instructions, destination and activation controls."),
    ("components/store/CollectionPage.tsx", "Shop and category banner selection plus code fallbacks."),
    ("components/store/BannerSlider.tsx", "Shared banner rendering and default image behavior."),
    ("components/store/VayziqPageBanner.tsx", "About, Contact and legal page banner layout and default image."),
    ("app/(store)/offers/page.tsx", "Code based Offers page hero and live offer card layout."),
    ("prisma/schema.prisma", "Banner and Coupon database models."),
]
for path, desc in sources: story.append(bullet(f"<b>{path}</b>  {desc}"))

story.append(P("Recommended future cleanup", "H1x"))
for text in [
    "Add dedicated Admin placements for About, Contact, Legal and Offers page heroes if non developers need to change them.",
    "Keep editorial Offer Zone banners and coupon cards as separate controls because they serve different purposes.",
    "Use one documented image ratio per placement and preview desktop and mobile crops before enabling a banner.",
    "Rename the Admin label Home Offer Zone to Offer Editorial Banners if users confuse it with coupon cards.",
]: story.append(bullet(text))

doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
print(OUT)
