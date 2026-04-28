const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  Header, Footer, PageNumber, NumberFormat
} = require("docx");

exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method not allowed" };

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch(e) {
    return { statusCode: 400, headers, body: "Bad JSON" };
  }

  var plan = body.plan;
  var state = body.state || {};
  if (!plan || !plan.client) {
    return { statusCode: 400, headers, body: "Missing plan data" };
  }

  var c = plan.client;
  var gold = "F0A500";
  var dark = "0A1628";
  var cardBg = "142444";
  var textSec = "8FA3C0";
  var white = "E8EDF5";

  try {
    // ── Build sections ──
    var children = [];

    // Header
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "THE DOC LOVATO METHOD", bold: true, size: 40, color: gold, font: "Arial" }),
      ]
    }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Dr. Michael Lovato, EdD — NASM CNC/CES/PES", size: 18, color: textSec, font: "Arial" }),
      ]
    }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({ text: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), size: 18, color: textSec, font: "Arial" }),
      ]
    }));

    // Title
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "MACRO PLAN — " + (c.name || "CLIENT").toUpperCase(), bold: true, size: 36, color: dark, font: "Arial" }),
      ]
    }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({ text: (c.goal || state.goal || "Body Recomposition").toUpperCase() + " PROTOCOL", size: 22, color: textSec, font: "Arial" }),
      ]
    }));

    // Conditions badges
    if (state.conditions && state.conditions.length > 0) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: "Health Protocols: " + state.conditions.join(", "), size: 20, color: gold, bold: true, font: "Arial" }),
        ]
      }));
    }

    // ── DAILY TARGETS ──
    children.push(sectionTitle("DAILY TARGETS"));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: String(c.calories || 0), bold: true, size: 52, color: gold, font: "Arial" }),
        new TextRun({ text: " kcal / day", size: 22, color: textSec, font: "Arial" }),
      ]
    }));

    var macroTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            macroCell("PROTEIN", (c.protein || 0) + "g", "2DD4BF"),
            macroCell("CARBS", (c.carbs || 0) + "g", gold),
            macroCell("FAT", (c.fat || 0) + "g", "F4A261"),
          ]
        })
      ]
    });
    children.push(macroTable);
    children.push(spacer());

    // ── BMR BREAKDOWN ──
    if (state.bmrBlended) {
      children.push(sectionTitle("CALCULATION BREAKDOWN"));
      children.push(infoRow("Cunningham BMR", (state.bmrCunningham || 0) + " kcal"));
      children.push(infoRow("Mifflin-St Jeor BMR", (state.bmrMifflin || 0) + " kcal"));
      children.push(infoRow("Blended BMR (average)", (state.bmrBlended || 0) + " kcal"));
      children.push(infoRow("TDEE (activity × " + (state.activity || 1.55) + ")", (state.tdee || 0) + " kcal"));
      children.push(infoRow("Calorie Target (" + (state.goal || "Recomp") + ")", (c.calories || 0) + " kcal/day"));
      children.push(spacer());
    }

    // ── MEAL PLAN ──
    children.push(sectionTitle("MEAL PLAN"));
    (plan.meals || []).forEach(function(meal) {
      children.push(new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({ text: (meal.emoji || "") + " " + meal.name, bold: true, size: 24, color: dark, font: "Arial" }),
          new TextRun({ text: "  " + (meal.time || ""), size: 18, color: textSec, font: "Arial" }),
        ]
      }));

      if (meal.foods && meal.foods.length > 0) {
        var foodRows = [
          new TableRow({
            children: [
              headerCell("Food"), headerCell("Amount"), headerCell("P"), headerCell("C"), headerCell("F"), headerCell("Cal")
            ]
          })
        ];

        meal.foods.forEach(function(f) {
          foodRows.push(new TableRow({
            children: [
              bodyCell(f.name || ""),
              bodyCell(f.amount || ""),
              bodyCell(String(f.protein || 0) + "g"),
              bodyCell(String(f.carbs || 0) + "g"),
              bodyCell(String(f.fat || 0) + "g"),
              bodyCell(String(f.calories || 0)),
            ]
          }));
        });

        // Totals row
        var t = meal.totals || {};
        foodRows.push(new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true, size: 18, color: gold, font: "Arial" })] })], shading: { type: ShadingType.SOLID, color: "F5F0E0" } }),
            new TableCell({ children: [new Paragraph("")], shading: { type: ShadingType.SOLID, color: "F5F0E0" } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (t.protein || 0) + "g", bold: true, size: 18, font: "Arial" })] })], shading: { type: ShadingType.SOLID, color: "F5F0E0" } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (t.carbs || 0) + "g", bold: true, size: 18, font: "Arial" })] })], shading: { type: ShadingType.SOLID, color: "F5F0E0" } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (t.fat || 0) + "g", bold: true, size: 18, font: "Arial" })] })], shading: { type: ShadingType.SOLID, color: "F5F0E0" } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(t.calories || 0), bold: true, size: 18, color: gold, font: "Arial" })] })], shading: { type: ShadingType.SOLID, color: "F5F0E0" } }),
          ]
        }));

        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: foodRows
        }));
      }
    });

    children.push(spacer());

    // ── SUPPLEMENTS ──
    if (plan.supplements) {
      children.push(sectionTitle("SUPPLEMENT STACK"));

      if (plan.supplements.foundation && plan.supplements.foundation.length > 0) {
        children.push(new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: "FOUNDATION TIER", bold: true, size: 18, color: textSec, font: "Arial" })]
        }));
        plan.supplements.foundation.forEach(function(s) {
          children.push(new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: s.name, bold: true, size: 20, color: dark, font: "Arial" }),
              new TextRun({ text: " — " + s.dose + " | " + s.timing, size: 18, color: textSec, font: "Arial" }),
            ]
          }));
          if (s.reason) {
            children.push(new Paragraph({
              spacing: { after: 80 },
              children: [new TextRun({ text: s.reason, size: 16, italics: true, color: textSec, font: "Arial" })]
            }));
          }
        });
      }

      if (plan.supplements.performance && plan.supplements.performance.length > 0) {
        children.push(new Paragraph({
          spacing: { before: 120, after: 80 },
          children: [new TextRun({ text: "PERFORMANCE TIER", bold: true, size: 18, color: textSec, font: "Arial" })]
        }));
        plan.supplements.performance.forEach(function(s) {
          children.push(new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: s.name, bold: true, size: 20, color: dark, font: "Arial" }),
              new TextRun({ text: " — " + s.dose + " | " + s.timing, size: 18, color: textSec, font: "Arial" }),
            ]
          }));
        });
      }
      children.push(spacer());
    }

    // ── FOODS TO PRIORITIZE / AVOID ──
    if (plan.foods_prioritize && plan.foods_prioritize.length > 0) {
      children.push(sectionTitle("FOODS TO PRIORITIZE"));
      children.push(new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: plan.foods_prioritize.join("  •  "), size: 20, color: "2DD4BF", font: "Arial" })]
      }));
    }
    if (plan.foods_avoid && plan.foods_avoid.length > 0) {
      children.push(new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: "FOODS TO AVOID", bold: true, size: 20, color: "E63946", font: "Arial" })]
      }));
      children.push(new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: plan.foods_avoid.join("  •  "), size: 20, color: "E63946", font: "Arial" })]
      }));
    }

    // ── COACHING NOTES ──
    if (plan.coaching_notes && plan.coaching_notes.length > 0) {
      children.push(sectionTitle("COACHING NOTES"));
      plan.coaching_notes.forEach(function(note) {
        children.push(new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: note.title, bold: true, size: 20, color: gold, font: "Arial" })]
        }));
        children.push(new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: note.body, size: 18, color: "444444", font: "Arial" })]
        }));
      });
    }

    // ── FOOTER ──
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({ text: "The Doc Lovato Method — Dr. Michael Lovato, EdD — Confidential", size: 16, color: textSec, font: "Arial" }),
      ]
    }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "For " + (c.name || "client") + "'s use only", size: 14, color: textSec, font: "Arial" }),
      ]
    }));

    // ── BUILD DOC ──
    var doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    var buffer = await Packer.toBuffer(doc);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=" + (c.name || "Client").replace(/\s+/g, "_") + "_Macro_Plan_DocLovatoMethod.docx"
      },
      body: buffer.toString("base64"),
      isBase64Encoded: true
    };

  } catch(err) {
    return {
      statusCode: 500,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};

// ── Helper functions ──

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 200, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "F0A500" } },
    children: [new TextRun({ text: text, bold: true, size: 26, color: "0A1628", font: "Arial" })]
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 200 }, children: [] });
}

function infoRow(label, value) {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: label + ": ", size: 20, color: "666666", font: "Arial" }),
      new TextRun({ text: value, bold: true, size: 20, color: "0A1628", font: "Arial" }),
    ]
  });
}

function macroCell(label, value, color) {
  return new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: value, bold: true, size: 28, color: color, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: label, size: 16, color: "8FA3C0", font: "Arial" })]
      })
    ],
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }
    }
  });
}

function headerCell(text) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: text, bold: true, size: 16, color: "FFFFFF", font: "Arial" })]
    })],
    shading: { type: ShadingType.SOLID, color: "F0A500" }
  });
}

function bodyCell(text) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: text, size: 18, font: "Arial" })]
    })]
  });
}
