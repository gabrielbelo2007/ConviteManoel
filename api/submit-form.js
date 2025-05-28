const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  // Desestruturar o 'email' junto com nome e telefone
  const { nome, telefone, email } = req.body;

  if (!nome || !telefone || !email) { // Adicionar 'email' na validação
    return res.status(400).json({ success: false, message: 'Nome, telefone e e-mail são obrigatórios.' });
  }

  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    // O range agora precisa cobrir a nova coluna de e-mail (ex: A:D se você tiver Nome, Telefone, E-mail, Data)
    const range = 'Página1!A:D'; // <--- AJUSTE AQUI PARA INCLUIR A NOVA COLUNA DO E-MAIL

    // Adicionar o 'email' aos valores que serão inseridos
    const values = [[nome, telefone, email, new Date().toLocaleString('pt-BR')]]; // <--- AJUSTE AQUI PARA INCLUIR O E-MAIL

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