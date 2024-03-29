//DECLARE IMPORTS
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const {TesseractWorker} = require('tesseract.js');
const app = express();
const worker = new TesseractWorker();
//STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "./uploads")
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});
//UPLOADS
const upload = multer({storage: storage}).single("input-file");
app.set("view engine", "ejs");
app.use(express.static("public"));
//ROUTES
app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.post("/upload", (req, res) => {
    upload(req, res, err =>{
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if(err) return console.log(err);

            worker
            .recognize(data, "eng", { tessjs_create_pdf: '1' })
            .progress(progress => {
                console.log(progress);
            })
            .then(result =>{
                res.redirect('/download');
            })
            .finally(() => worker.terminate());
        });
    });
});

app.get('/download', (req, res) =>{
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
});

//STARTUP
const PORT = 5000 || process.env.PORT;
app.listen(PORT, console.log(`RUNNING AT PORT: ${PORT}`));