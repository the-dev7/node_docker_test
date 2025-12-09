// express is a framework built on top of NodeJS.. 
const express = require('express');
const Joi = require('joi');
const { compressVideo, getNameForCompressedFile, compressImage } = require('./compressService');

const TestTableOperations = require("./query_operations/test-table");
const { serverResponse } = require('./utils/general');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();

// to enable parsing of JSON in request body
app.use(express.json());

const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' },
];

// custom functions here..
function validateCourse(course) {
    const schema = Joi.object({
        // a string data type, min length of 3 and is a required param
        name: Joi.string().min(3).required()
    });

    return schema.validate(course);   
}


// now this app object by convention represents our application

app.get('/', (req, res) => {
    res.send('Hello World');
});

// route: ./api/courses
app.get('/api/courses', (req, res) => {
    res.send(courses);
})

// route parameters
app.get('/api/posts/:year/:month', (req, res) => {
    // req.params: represents the parameters as a JSON string response
    res.send(req.params);
});

// QueryString parameter: path?sortBy=name [param after ? is QueryString]
app.get('/api/courses/:id', (req, res) => {
    let course = courses.find(c => c.id === parseInt(req.params.id));
    // handle not found data..
    if (!course) {
        res.status(404).send("Course with given ID not found");
        return;
    }
    res.send(course);
});


// POST request: create a course
app.post('/api/courses', (req, res) => {
    
    // // input validation.. [traditional method]
    // if (!req.body.name || req.body.name.length < 3) {
    //     res.status(404).send("Name is required.. and should be minimum 3 characters long");
    //     return;
    // }
    
    // using JOI package for validation
    const result = validateCourse(req.body);
    if (result.error) {
        res.status(404).send(result.error.details[0].message);
        return;
    }

    const course = {
        id: courses.length + 1,
        name: req.body.name,
    };
    courses.push(course);
    res.send(course);
});


// PUT request: update value [course]
app.put('/api/courses/:id', (req, res) => {
    // PUT LOGIC:
    // look up the course
    // if not exist, return 404
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) res.status(404).send('The course with given ID does not exist');

    // validate
    // if invalid, return 400 - Bad Request

    // object de-structure
    const { error } = validateCourse(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    // else, update course
    // return the updated course
    course.name = req.body.name;
    res.send(course);
});

// DELETE request:
app.delete('/api/courses/:id', (req, res) => {
    // Look up the course
    // Not existing, return 404
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        res.status(404).send('This course ID does not exist');
        return;
    }
    // Delete
    const index = courses.indexOf(course);
    courses.splice(index, 1);

    // Return the same course
    res.send(course);
});

app.get('/api/timezone', (req, res) => {
    res.send(getTimeZoneIdByTimestamp(""));
});

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    const compressionValue = 25;
    const outputImageName = getNameForCompressedFile(req.file.originalname, compressionValue);
    const compressedResponse = await compressImage(req.file.path, outputImageName, 25);

    res.json(compressedResponse);
});

app.post('/api/upload-video', upload.single('video'), async (req, res) => {
    const outputVideoName = getNameForCompressedFile(req.file.originalname);
    const compressedResponse = await compressVideo(req.file.path, outputVideoName);
    
    // return response from compression function
    res.json(compressedResponse)
});

// centralized API
app.post('/api/upload-file', upload.single('file'), async (req, res) => {

    const fileType = req.file.mimetype;
    let compressedResponse;

    if (fileType.includes('image/')) {
        const compressionValue = 25;
        const outputImageName = getNameForCompressedFile(req.file.originalname, compressionValue);
        compressedResponse = await compressImage(req.file.path, outputImageName, 25);
    } else if (fileType.includes('video/')) {
        const outputVideoName = getNameForCompressedFile(req.file.originalname);
        compressedResponse = await compressVideo(req.file.path, outputVideoName);
    }

    // return response from compression function
    res.json(compressedResponse)
});


app.post('/api/test-upload', upload.single('file'), (req, res) => {
    const file = req.file;

    // method to rename file with '_compressed' name
    const compressedFileName = getNameForCompressedFile(file.originalname); 
    // end of method

    res.json({
        path: file.path, 
        name: file.originalname, 
        compressedFileName: compressedFileName
    });
});


// db specific endpts
app.post('/api/create-item', async (req, res) => {
   const { text } = req.body;
   const x = await TestTableOperations.createNewField(text);
   console.log(x.dataValues);
   serverResponse(200,"",`Created field: ${x}`,res);
});

app.get('/api/view-items', async (req, res) => {
    const data = await TestTableOperations.findAllFields();
    console.log(data);
    serverResponse(200, "", data, res);
});

module.exports = app;


// // allow to switch to different port if not available
// const port = process.env.PORT || 4500;

// app.listen(port, () => console.log(`Listening to port ${port}`));