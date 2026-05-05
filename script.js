// ================= GENERATE MATRIX =================
function generateMatrix() {
    const r = parseInt(document.getElementById("rows").value);
    const c = parseInt(document.getElementById("cols").value);

    let html = "<table>";

    for (let i = 0; i < r; i++) {
        html += "<tr>";
        for (let j = 0; j < c; j++) {
            html += `<td><input id="m_${i}_${j}" value="0"></td>`;
        }
        html += "</tr>";
    }

    html += "</table>";

    document.getElementById("matrixInput").innerHTML = html;
}

// ================= GET MATRIX =================
function getMatrix() {
    const r = parseInt(document.getElementById("rows").value);
    const c = parseInt(document.getElementById("cols").value);

    let m = [];

    for (let i = 0; i < r; i++) {
        let row = [];
        for (let j = 0; j < c; j++) {
            let val = document.getElementById(`m_${i}_${j}`).value;
            row.push(parseFloat(val) || 0);
        }
        m.push(row);
    }

    return m;
}

// ================= MATRIX TO LATEX =================
function toLatex(m) {
    return "\\begin{bmatrix}" +
        m.map(r => r.join(" & ")).join(" \\\\ ") +
        "\\end{bmatrix}";
}

// ================= GAUSS JORDAN =================
function gaussJordan(m) {
    let steps = [];
    let r = m.length;
    let c = m[0].length;

    let A = JSON.parse(JSON.stringify(m));

    steps.push({
        desc: "Matriks awal",
        m: JSON.parse(JSON.stringify(A))
    });

    for (let i = 0; i < r; i++) {

        // cari pivot jika 0
        if (Math.abs(A[i][i]) < 1e-9) {
            for (let k = i + 1; k < r; k++) {
                if (Math.abs(A[k][i]) > 1e-9) {
                    [A[i], A[k]] = [A[k], A[i]];
                    steps.push({
                        desc: `R${i + 1} ↔ R${k + 1}`,
                        m: JSON.parse(JSON.stringify(A))
                    });
                    break;
                }
            }
        }

        let pivot = A[i][i];

        // normalisasi pivot
        if (Math.abs(pivot) > 1e-9) {
            for (let j = 0; j < c; j++) {
                A[i][j] /= pivot;
            }

            steps.push({
                desc: `R${i + 1} = R${i + 1} / ${pivot}`,
                m: JSON.parse(JSON.stringify(A))
            });
        }

        // eliminasi
        for (let k = 0; k < r; k++) {
            if (k !== i) {
                let factor = A[k][i];

                if (Math.abs(factor) > 1e-9) {
                    for (let j = 0; j < c; j++) {
                        A[k][j] -= factor * A[i][j];
                    }

                    steps.push({
                        desc: `R${k + 1} = R${k + 1} - (${factor})R${i + 1}`,
                        m: JSON.parse(JSON.stringify(A))
                    });
                }
            }
        }
    }

    return { steps, result: A };
}

// ================= INTERPRET SOLUTION =================
function interpretSolution(matrix) {
    const r = matrix.length;
    const c = matrix[0].length;

    let solutions = new Array(c - 1).fill(null);
    let freeVars = 0;

    for (let i = 0; i < r; i++) {

        let allZero = true;
        let pivotIndex = -1;

        for (let j = 0; j < c - 1; j++) {
            if (Math.abs(matrix[i][j]) > 1e-9) {
                allZero = false;
                pivotIndex = j;
                break;
            }
        }

        // tidak ada solusi
        if (allZero && Math.abs(matrix[i][c - 1]) > 1e-9) {
            return { status: "NO_SOLUTION", solutions: [] };
        }

        if (!allZero && pivotIndex !== -1) {
            solutions[pivotIndex] = matrix[i][c - 1];
        }
    }

    for (let i = 0; i < solutions.length; i++) {
        if (solutions[i] === null) freeVars++;
    }

    if (freeVars > 0) {
        return { status: "INFINITE", solutions };
    }

    return { status: "UNIQUE", solutions };
}

// ================= SOLVE =================
function solve() {
    const m = getMatrix();
    const { steps, result } = gaussJordan(m);

    let html = "";

    // MASUKAN
    html += "<h2>MASUKAN</h2>";
    html += `\\[${toLatex(steps[0].m)}\\]`;

    // LANGKAH
    html += "<h2>LANGKAH</h2>";
    steps.forEach(s => {
        html += `<p>\\(${s.desc}\\)</p>`;
        html += `\\[${toLatex(s.m)}\\]`;
    });

    // HASIL
    html += "<h2>HASIL AKHIR</h2>";

    const { status, solutions } = interpretSolution(result);

    if (status === "NO_SOLUTION") {
        html += "<p><b>Tidak ada solusi</b></p>";
    } else if (status === "INFINITE") {
        html += "<p><b>Tak hingga solusi</b></p>";
        html += "<p>Beberapa variabel bebas tidak dapat ditentukan.</p>";
    } else {
        html += "<p><b>Solusi unik:</b></p>";
        for (let i = 0; i < solutions.length; i++) {
            html += `<p>x${i + 1} = ${solutions[i]}</p>`;
        }
    }

    document.getElementById("output").innerHTML = html;

    MathJax.typesetPromise();
}

// auto generate saat load
generateMatrix();