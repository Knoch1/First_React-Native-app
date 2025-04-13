import * as MailComposer from "expo-mail-composer";
import * as Print from "expo-print";
import {Alert} from "react-native";

const sendPDF = async (data) => {
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f4f4f4; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        tr:hover { background-color: #f1f1f1; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <h2>Allgemeine Informationen</h2>
      <table>
        <tr><th>Name</th><td>${data.Name}</td></tr>
        <tr><th>Adresse</th><td>${data.Adresse}</td></tr>
        <tr><th>PLZ-Ort</th><td>${data.PLZORT}</td></tr>
        <tr><th>Tel</th><td>${data.Tel}</td></tr>
        <tr><th>Email</th><td>${data.Emailadresse}</td></tr>
        <tr><th>Steuernummer</th><td>${data.Steuernummer}</td></tr>
        <tr><th>Partita Iva</th><td>${data.PartitaIva}</td></tr>
        <tr><th>Kodex</th><td>${data.Kodex}</td></tr>
      </table>
  `;

  data.pos.forEach((pos, index) => {
    htmlContent += `
      <div class="page-break"></div>
      <h2>POS ${pos.name}</h2>
      <table>
        <tr><th>Variante</th><td>${pos.variante}</td></tr>
        <tr><th>Einbauort</th><td>${pos.einbauort}</td></tr>
        <tr><th>Menge</th><td>${pos.menge}</td></tr>
        <tr><th>Breite Lichte</th><td>${pos.breite}</td></tr>
        <tr><th>Höhe Lichte</th><td>${pos.hoehe}</td></tr>
        <tr><th>Farbe</th><td>${pos.farbe}</td></tr>
        <tr><th>Gewebe</th><td>${pos.gewebe}</td></tr>
        <tr><th>Maß X</th><td>${pos.masx}</td></tr>
        <tr><th>Maß Y</th><td>${pos.masy}</td></tr>
        <tr><th>Maß Z</th><td>${pos.masz}</td></tr>
        <tr><th>Lage der Bürsten</th><td>${pos.buerste}</td></tr>
        <tr><th>Öffnungsrichtung</th><td>${pos.richtung}</td></tr>
        <tr><th>Schiebeverschluss</th><td>${pos.verschluss}</td></tr>
        <tr><th>Griffhöhe</th><td>${pos.griff}</td></tr>
        <tr><th>Montagebohrung</th><td>${pos.montage}</td></tr>
        <tr><th>Besonderheiten</th><td>${pos.besonderheit}</td></tr>
        <tr><th>Montagebeschreibung</th><td>${pos.beschreibung}</td></tr>
      </table>
    `;
  });
  htmlContent += `</body></html>`;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
    });
    const result = await MailComposer.composeAsync({
      recipients: ["wenin@isn-italien.it"], // Replace with the recipient email
      subject: `${data.Name}`,
      body: "Bitte für diesen Kunden ein Angebot erstellen.",
      attachments: [uri],
    });

  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

export default sendPDF;
