// Lógica de acordeones
function toggleStep(headerElement) {
    headerElement.parentElement.classList.toggle('collapsed');
}

// Lógica de Cálculo
function calculate() {
    // Datos básicos
    const h = parseFloat(document.getElementById('h').value) || 0;
    const m = parseFloat(document.getElementById('m').value) || 0;
    const time = h + (m / 60);
    const weight = parseFloat(document.getElementById('weight').value) || 0;

    // Material
    const fPrice = parseFloat(document.getElementById('fPrice').value) || 0;
    const fWeight = parseFloat(document.getElementById('fWeight').value) || 1000;
    const waste = parseFloat(document.getElementById('waste').value) || 0;

    const matSelect = document.getElementById('materialType');
    const matName = matSelect.options[matSelect.selectedIndex].text;

    // Coste Base Material
    const matCost = ((weight * (1 + waste / 100)) * fPrice) / fWeight;

    // Extras
    let extras = 0;

    // Luz
    if (document.getElementById('useElec').checked) {
        extras += (parseFloat(document.getElementById('watt').value) / 1000) * time * parseFloat(document.getElementById('kwhPrice').value);
    }

    // Mano de Obra
    if (document.getElementById('useLabor').checked) {
        extras += (parseFloat(document.getElementById('prepMin').value) / 60) * parseFloat(document.getElementById('laborPrice').value);
    }

    // Amortización (Estimación 300h/mes)
    if (document.getElementById('useAmort').checked) {
        const pCost = parseFloat(document.getElementById('printerCost').value);
        const months = parseFloat(document.getElementById('amortMonths').value);
        if (months > 0) {
            extras += (pCost / (months * 300)) * time;
        }
    }

    const profit = parseFloat(document.getElementById('profit').value) || 0;
    const total = (matCost + extras) * (1 + profit / 100);

    // Actualizar banner web
    document.getElementById('display-total').innerText = total.toFixed(2) + " €";

    return {
        client: document.getElementById('clientName').value || "Sin_Nombre",
        project: document.getElementById('projectName').value || "Proyecto_3D",
        matName: matName,
        weight: weight,
        cMat: matCost.toFixed(2),
        cExtras: extras.toFixed(2),
        total: total.toFixed(2),
        hasExtras: extras > 0.01
    };
}

// Generar PDF
function generatePDF() {
    const data = calculate();

    // 1. Rellenar datos en el template oculto
    document.getElementById('pdf-client').innerText = data.client;
    document.getElementById('pdf-project').innerText = data.project;
    document.getElementById('pdf-date').innerText = new Date().toLocaleDateString();
    document.getElementById('pdf-total').innerText = data.total + " €";

    // 2. Construir filas de la tabla
    let htmlRows = `
        <tr>
            <td>
                <strong>Material seleccionado: ${data.matName}</strong><br>
                <span style="color: #666; font-size: 13px;">Peso de la pieza: ${data.weight}g</span>
            </td>
            <td style="text-align: right;">${data.cMat} €</td>
        </tr>
    `;

    if (data.hasExtras) {
        htmlRows += `
            <tr>
                <td>
                    <strong>Gastos Operativos</strong><br>
                    <span style="color: #666; font-size: 13px;">Energía, preparación y/o amortización</span>
                </td>
                <td style="text-align: right;">${data.cExtras} €</td>
            </tr>
        `;
    }

    document.getElementById('pdf-rows').innerHTML = htmlRows;

    // 3. Configuración para html2pdf
    const element = document.getElementById('invoice-template');
    const opt = {
        margin: 10,
        filename: `Presupuesto_${data.client}_${data.project}.pdf`.replace(/\s+/g, '_'),
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}