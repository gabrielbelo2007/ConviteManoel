const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  const { nome, telefone } = req.body;

  if (!nome || !telefone) {
    return res.status(400).json({ success: false, message: 'Nome e telefone são obrigatórios.' });
  }

  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Substitui \\n por quebra de linha real
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Página1!A:C'; // Onde "Página1" é o nome da sua aba na planilha
    const values = [[nome, telefone, new Date().toLocaleString('pt-BR')]]; // Adiciona nome, telefone e data/hora

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    });

    res.status(200).json({ success: true, message: 'Dados salvos na planilha com sucesso!' });

  } catch (error) {
    console.error('Erro ao salvar na planilha:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor ao salvar os dados.' });
  }
};