////////////////////////
// تعريف عناصر الصفحة
////////////////////////

const username = document.getElementById("username");
const password = document.getElementById("password");

const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");

const errorMsg = document.getElementById("errorMsg");

const assetId = document.getElementById("assetId");
const itemName = document.getElementById("itemName");
const quantity = document.getElementById("quantity");
const value = document.getElementById("value");
const depreciation = document.getElementById("depreciation");
const entryDate = document.getElementById("entryDate");
const condition = document.getElementById("condition");
const imageInput = document.getElementById("imageInput");

const tableBody = document.getElementById("tableBody");

const totalAssets = document.getElementById("totalAssets");
const totalAfter = document.getElementById("totalAfter");

const searchInput = document.getElementById("searchInput");

let lastId = 0;

////////////////////////
// تسجيل الدخول
////////////////////////

function login(){

const user = username.value.trim();
const pass = password.value.trim();

if(user === "admin" && pass === "777416883"){

loginPage.style.display = "none";
appPage.style.display = "block";

errorMsg.innerText = "";

generateId();
loadAssets();

}
else{

errorMsg.innerText = "اسم المستخدم أو كلمة المرور غير صحيحة";

}

}

////////////////////////
// تسجيل الخروج
////////////////////////

function logout(){

loginPage.style.display = "block";
appPage.style.display = "none";

username.value = "";
password.value = "";

}

////////////////////////
// توليد رقم أصل
////////////////////////

function generateId(){

lastId++;

assetId.value = "AS-" + lastId.toString().padStart(4,"0");

}

////////////////////////
// حساب القيمة بعد الإهلاك
////////////////////////

function calculateFinal(value,dep){

return value - (value * dep / 100);

}

////////////////////////
// إضافة أصل
////////////////////////

function addItem(){

if(!itemName.value){

alert("ادخل اسم الأصل");

return;

}

if(!imageInput.files[0]){

alert("أضف صورة الأصل");

return;

}

const reader = new FileReader();

reader.onload = e => {

let val = parseFloat(value.value) || 0;
let dep = parseFloat(depreciation.value) || 0;

let finalValue = calculateFinal(val,dep);

const item = {

assetId: assetId.value,
name: itemName.value,
quantity: quantity.value,
value: val,
depreciation: dep,
finalValue: finalValue,
date: entryDate.value,
condition: condition.value,
image: e.target.result

};

const tx = db.transaction("assets","readwrite");

tx.objectStore("assets").put(item);

tx.oncomplete = () => {

generateId();
loadAssets();

};

};

reader.readAsDataURL(imageInput.files[0]);

}
////////////////////////
// تحميل الأصول
////////////////////////

function loadAssets(){

tableBody.innerHTML = "";

let count = 0;
let total = 0;

const tx = db.transaction("assets","readonly");

tx.objectStore("assets").openCursor().onsuccess = e => {

const cursor = e.target.result;

if(cursor){

const i = cursor.value;

count++;
total += i.finalValue;

tableBody.innerHTML += `

<tr>
<td>${i.assetId}</td>
<td>${i.name}</td>
<td>${i.quantity}</td>
<td>${i.value}</td>
<td>${i.depreciation}%</td>
<td>${i.finalValue}</td>
<td>${i.date}</td>
<td>${i.condition}</td>
<td><img src="${i.image}" width="50"></td>
<td><svg id="barcode-${i.assetId}"></svg></td>
<td><button onclick="deleteItem('${i.assetId}')">❌</button></td>
</tr>

`;

setTimeout(()=>{

JsBarcode(`#barcode-${i.assetId}`, i.assetId);

},100);

cursor.continue();

}

else{

totalAssets.innerText = count;
totalAfter.innerText = total.toLocaleString();

}

};

}

////////////////////////
// حذف أصل
////////////////////////

function deleteItem(id){

if(confirm("هل تريد حذف الأصل؟")){

const tx = db.transaction("assets","readwrite");

tx.objectStore("assets").delete(id);

tx.oncomplete = loadAssets;

}

}

////////////////////////
// البحث
////////////////////////

function searchTable(){

let val = searchInput.value.toLowerCase();

document.querySelectorAll("#tableBody tr").forEach(row=>{

row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";

});

}

////////////////////////
// النسخة الاحتياطية
////////////////////////

function backup(){

const tx = db.transaction("assets","readonly");

const store = tx.objectStore("assets");

const data = [];

store.openCursor().onsuccess = e => {

const cursor = e.target.result;

if(cursor){

data.push(cursor.value);

cursor.continue();

}

else{

const link = document.createElement("a");

link.href = "data:text/json;charset=utf-8," +
encodeURIComponent(JSON.stringify(data,null,2));

link.download = "assets_backup.json";

link.click();

}

};

}

////////////////////////
// مسح جميع البيانات
////////////////////////

function clearAll(){

if(confirm("هل تريد حذف جميع البيانات؟")){

const tx = db.transaction("assets","readwrite");

tx.objectStore("assets").clear();

tx.oncomplete = () => {

loadAssets();

};

}

}