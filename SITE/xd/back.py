from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore, storage

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('sagemcommtest-firebase-adminsdk-x2xog-90c7ccb15e.json')  # Replace with your key file path
firebase_admin.initialize_app(cred, {
    'storageBucket': 'sagemcommtest.appspot.com'  # Use your Project ID with `.appspot.com`
})

db = firestore.client()
bucket = storage.bucket()

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'}), 400

    uploaded_files = request.files.getlist('files')
    
    # Loop through files and upload them
    file_urls = []
    for file in uploaded_files:
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
        file_urls.append(blob.public_url)

    return jsonify({'message': 'Files uploaded successfully', 'urls': file_urls}), 200

if __name__ == '__main__':
    app.run(debug=True)
