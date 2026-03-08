let db;

/* فتح قاعدة البيانات */

const request = indexedDB.open("AssetDB", 1);

/* إنشاء الجداول أول مرة */

request.onupgradeneeded = function(e){

db = e.target.result;

/* إنشاء جدول الأصول */

if(!db.objectStoreNames.contains("assets")){

db.createObjectStore("assets", {
keyPath: "assetId"
});

}

};

/* عند نجاح الاتصال */

request.onsuccess = function(e){

db = e.target.result;

console.log("تم فتح قاعدة البيانات بنجاح");

loadAssets();

};

/* معالجة الأخطاء */

request.onerror = function(){

console.error("فشل في فتح قاعدة البيانات");

alert("حدث خطأ في فتح قاعدة البيانات");

};