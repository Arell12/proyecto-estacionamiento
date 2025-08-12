// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "tu_api_key",
    authDomain: "tu_auth_domain",
    projectId: "tu_project_id",
    storageBucket: "tu_storage_bucket",
    messagingSenderId: "tu_messaging_sender_id",
    appId: "tu_app_id",
    measurementId: "tu_measurement_Id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar Firebase Storage
const storage = getStorage(app)

export { storage, ref, uploadBytes, getDownloadURL };
