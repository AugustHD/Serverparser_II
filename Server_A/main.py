from fastapi import FastAPI, HTTPException
import requests
import csv
import json
import yaml
import xml.etree.ElementTree as ET

app = FastAPI()

# Sample data files for parsing
csv_file = 'data.csv'
json_file = 'data.json'
yaml_file = 'data.yaml'
txt_file = 'data.txt'
xml_file = 'data.xml'

# Parsing functions
def parse_csv():
    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        data = list(reader)
    print(data)
    return data

def parse_json():
    with open(json_file, 'r') as file:
        data = json.load(file)
    print(data)
    return data

def parse_yaml():
    with open(yaml_file, 'r') as file:
        data = yaml.safe_load(file)
    print(data)
    return data

def parse_txt():
    with open(txt_file, 'r') as file:
        data = file.read()
    print(data)
    return data

def parse_xml():
    tree = ET.parse(xml_file)
    root = tree.getroot()
    data = []

    for book in root.findall('book'):
        book_data = {}
        for child in book:
            book_data[child.tag] = child.text
        data.append(book_data)

    print(data)
    return data

@app.get("/get_data")
async def get_data(format: str):
    if format not in ['csv', 'json', 'yaml', 'txt', 'xml']:
        raise HTTPException(status_code=400, detail="Unsupported format")

    if format == 'csv':
        data = parse_csv()
    elif format == 'json':
        data = parse_json()
    elif format == 'yaml':
        data = parse_yaml()
    elif format == 'txt':
        data = parse_txt()
    elif format == 'xml':
        data = parse_xml()
    return data

# Server endpoint
@app.get("/process_data")
async def process_data(format: str):
    
   # return data
    # Forward request to Server B
    try:
        response = requests.get('http://localhost:5001/get_data', params={'format': format})
        return {'data_from_server_B': response.json()} 
    except:
        print('ERROR: Remember to ensure the node server running')