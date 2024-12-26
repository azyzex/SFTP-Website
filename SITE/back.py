from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore, storage

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('path/to/your/serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'your-project-id.appspot.com'
})

db = firestore.client()
bucket = storage.bucket()

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Upload file to Firebase Storage
    blob = bucket.blob(file.filename)
    blob.upload_from_file(file)
    
    # Save file metadata to Firestore
    file_ref = db.collection('files').document(file.filename)
    file_ref.set({
        'name': file.filename,
        'url': blob.public_url
    })

    return jsonify({'message': 'File uploaded successfully', 'url': blob.public_url}), 200

if __name__ == '__main__':
    app.run(debug=True)
