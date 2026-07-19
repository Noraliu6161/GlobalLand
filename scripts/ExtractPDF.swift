import Foundation
import PDFKit
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else {
    fputs("Usage: ExtractPDF <pdf> <outdir>\n", stderr)
    exit(1)
}

let pdfPath = args[1]
let outDir = args[2]
let url = URL(fileURLWithPath: pdfPath)

guard let doc = PDFDocument(url: url) else {
    fputs("Failed to open PDF\n", stderr)
    exit(1)
}

try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

var text = ""
let pageCount = doc.pageCount
print("Pages: \(pageCount)")

for i in 0..<pageCount {
    guard let page = doc.page(at: i) else { continue }
    let bounds = page.bounds(for: .mediaBox)
    let scale: CGFloat = 2.0
    let size = CGSize(width: bounds.width * scale, height: bounds.height * scale)
    let image = NSImage(size: size)
    image.lockFocus()
    if let ctx = NSGraphicsContext.current?.cgContext {
        ctx.setFillColor(NSColor.white.cgColor)
        ctx.fill(CGRect(origin: .zero, size: size))
        ctx.saveGState()
        ctx.translateBy(x: 0, y: size.height)
        ctx.scaleBy(x: scale, y: -scale)
        page.draw(with: .mediaBox, to: ctx)
        ctx.restoreGState()
    }
    image.unlockFocus()

    if let tiff = image.tiffRepresentation,
       let rep = NSBitmapImageRep(data: tiff),
       let png = rep.representation(using: .png, properties: [:]) {
        let outPath = "\(outDir)/page-\(String(format: "%02d", i + 1)).png"
        try? png.write(to: URL(fileURLWithPath: outPath))
        print("Wrote \(outPath)")
    }

    if let pageText = page.string {
        text += "\n--- Page \(i + 1) ---\n"
        text += pageText
        text += "\n"
    }
}

let textPath = "\(outDir)/extracted-text.txt"
try? text.write(toFile: textPath, atomically: true, encoding: .utf8)
print("Wrote \(textPath)")
