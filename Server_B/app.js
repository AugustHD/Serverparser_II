const express = require('express');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser')
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

const app = express();
const port = 5001;

// Sample data files for parsing
const csvFile = '/data.csv';
const jsonFile = '/data.json';
const yamlFile = '/data.yaml';
const txtFile = '/data.txt';
const xmlFile = '/data.xml';

async function parseCSV() {
    return await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(`${__dirname}${csvFile}`)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        console.log(results);
        resolve(results);
     });

    });
}

async function parseTXT() {
    return await new Promise((resolve, reject) => {
        const txtData = fs.readFileSync(`${__dirname}${txtFile}`);
        console.log(txtData);
        resolve(txtData);
    }) 
}

function parseJSON() {
    const fileData = fs.readFileSync(`${__dirname}${jsonFile}`);
    const parsedJson = JSON.parse(fileData)
    return parsedJson;
}

function parseXML() {
    const xml = fs.readFileSync(`${__dirname}${xmlFile}`);
    const parser = new XMLParser();
    let jObj = parser.parse(xml);
    const builder = new XMLBuilder();
    const xmlContent = builder.build(jObj);
    return xmlContent;
}

function parseYAML() {
    const fileData = fs.readFileSync(`${__dirname}${yamlFile}`)
    const parsedYAML = YAML.parse(fileData)
    return parsedYAML;
}

const formatTypes = ['csv', 'json', 'yaml', 'txt', 'xml'];

// Server endpoint
app.get('/get_data', async (req, res) => {
    const format = req.query.format;
    if (!format || !formatTypes.includes(format)) {
        return res.status(400).json({ error: 'Unsupported format' });
    }

    let data;
    switch (format) {
        case 'csv':
            try {
                data = await parseCSV();
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error parsing CSV' });
            }
            break;
        case 'txt':
             try {
                data = await parseTXT();
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error parsing TXT' });
            }
            break;
        case 'json':
             try {
                data = parseJSON();
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error parsing JSON' });
            }
            break;
        case 'xml':
             try {
                data = parseXML();
            } catch (error) {
               console.error(error);
               return res.status(500).json({ error: 'Error parsing XML' });
            }
            break;
        case 'yaml':
             try {
                data = parseYAML();
            } catch (error) {
               console.error(error);
               return res.status(500).json({ error: 'Error parsing YAML' });
            }
            break;
    }
    res.send(data)
})

app.get('/process_data', async (req, res) => {
    const format = req.query.format;
    if (!format || !formatTypes.includes(format)) {
        return res.status(400).json({ error: 'Unsupported format' });
    }

    // Forwarding request to Server A
    // Works with 0.0.0.0 but not localhost for some weird reason.
    try {
        const response = await fetch('http://0.0.0.0:5000/get_data?format=' + format);
        const data =  await response.json();
        res.json({ data_from_server_A: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server B listening at http://localhost:${port}`);
});
