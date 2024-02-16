const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const {body, validationResult, check} = require('express-validator');
const  methodOverride = require('method-override');
// Flash Require
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash  = require('connect-flash');

require('./utils/db');
const Contact = require('./model/contact');

const app = express();
const port = 3000;

// Setup EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

// Konfigurasi Flash
app.use(cookieParser('secret'));
app.use(
    session({
        cookie: { maxAge: 6000},
        secret: 'secret',
        resave: true,
        saveUninitialized :true,
    })
);
app.use(flash());
// Method overide
app.use(methodOverride('_method'));

// Halaman Home
app.get('/', (req, res) => {
    const mahasiswa = [
        {
            nama: 'Sandhika',
            email : 'saghikagalih@gmail.com',
            nim : 'A11.2021.56678'
        },
        {
            nama : 'Erik',
            email : 'erik@gmail.com',
            nim : 'A11.2021.34527',
        },
        {
            nama : 'Doddy Ferdiansyah',
            email: 'doddyferdyansyah@gmail.com',
            nim : 'A11.2022.45328'
        },
    ];
res.render('index',{
    layout:'layouts/main-layout',
    nama: 'Sandhika',
    mahasiswa,
    title: 'Halaman Home',
    })
    console.log('ini halaman home');
});

// Halaman About
app.get('/about', (req, res) => {

    res.render('about', {
        title: 'Halaman About',
        layout: 'layouts/main-layout',
    });
});

// Halaman Contact
app.get('/contact', async (req, res) => {

    const contacts = await Contact.find();

    res.render('contact', {
        title: 'Halaman Contact',
        layout: 'layouts/main-layout',
        contacts,
        msg: req.flash('msg'),
    });
});

// Halaman tambah Data
app.get('/contact/add', (req, res) => {
    res.render('addContact', {
        title: 'Form Tambah Contact',
        layout: 'layouts/main-layout',
    });
});

// Proses Tambah Contact

app.post(
    '/contact',
    [
        body('nama').custom( async (value) => {
            const duplikat = await Contact.findOne({nama: value});
            if (duplikat) {
                throw new Error('Nama contact sudah digunakan');
            }
            return true;
        }),
        check('email', 'Email tidak valid').isEmail(),
        check('nohp', 'No HP tidak valid').isMobilePhone('id-ID'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.render('addContact', {
                title: 'Form Tambah Contact',
                layout: 'layouts/main-layout',
                errors: errors.array(),
            });
        } else {
            Contact.insertMany(req.body, (error, result) => {
                // Kirimkan flash message
                req.flash('msg', 'Data contact berhasil ditambahkan');
                res.redirect('/contact');
            });
        }
    }
)

// delete Contact
// app.get('/contact/delete/:nama', async (req, res) => {
//     const contact = await Contact.findOne({nama: req.params.nama});
//     if(!contact) {
//         res.status(404);
//         res.send('<h1>404</h1>');
//     } else {
//         Contact.deleteOne({_id: contact._id}).then((result)=> {
//             req.flash('msg', 'Contact berhasil dihapus!');
//             res.redirect('/contact');
//         });
//     }
// });

app.delete('/contact', (req, res) => {
    Contact.deleteOne({_id: req.body._id}).then((result) => {
        req.flash('msg', 'Contact Berhasil Dihapus');
        res.redirect('/contact');
    })
});

// Halaman Form Update Contact
app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({nama : req.params.nama});

    res.render('editContact', {
        title: 'Form Update Contact',
        layout: 'layouts/main-layout',
        contact,
    });
});

// Proses Update Contact
app.put(
    '/contact',
    [
        body('nama').custom( async (value, {req}) => {
            const duplikat = await Contact.findOne({nama: value});
            if (value !== req.body.oldNama && duplikat) {
                throw new Error('nama contact sudah digunakan!');
            }
            return true;
        }),
        check('email', 'Email tidak valid').isEmail(),
        check('nohp', 'No HP tidak valid').isMobilePhone('id-ID'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.render('editContact', {
                title: 'Form Update Contact',
                layout: 'layouts/main-layout',
                errors: errors.array(),
                contact:req.body,
            });
        } else {
            Contact.updateOne(
                {_id: req.body._id},
                {
                    $set:{
                        nama: req.body.nama,
                        nohp: req.body.nohp,
                        email: req.body.email,
                    },
                }
            ).then((result) => {
                req.flash('msg', 'Data Contact berhasil Diupdate!');
                res.redirect('/contact');
            });
        }
    }
)

// Halaman Detail Contact
app.get('/contact/:nama', async (req, res) => {
    
    const contact = await Contact.findOne({nama : req.params.nama})

    res.render('detail', {
        title: 'Halaman Detail Contact',
        layout: 'layouts/main-layout',
        contact,
    })
})

app.listen(port, () => {
    console.log(`Mongo Contact App is Listening at http://localhost:${port}`);
});