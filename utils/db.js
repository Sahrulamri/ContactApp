const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/mahasiswa', {
    useNewUrlParser :true,
    useUnifiedTopology: true,
    useCreateIndex :true,
});



// // Menambahkan Data
// const contact = new Contact({
//     nama : 'Rendi Ramadhan',
//     nohp : '081324567985',
//     email: 'rendiramadhan@gmail.com'
// });

// // Simpan Data ke Colections
// contact.save().then((contact) => console.log(contact));