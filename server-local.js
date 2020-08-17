const app = require('./express/server');

const PORT = process.env.$PORT || 3000;

app.listen(PORT, () => console.log(`Local app listening on port ${PORT}!`));
