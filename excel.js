async function exportToExcel(){

const workbook = new ExcelJS.Workbook();

const sheet = workbook.addWorksheet("الأصول");

/* العنوان */

sheet.mergeCells("A1:I2");

sheet.getCell("A1").value =
"إدارة الأصول - المعهد الوطني للعلوم الإدارية فرع إب";

sheet.getCell("A1").font = {
size:18,
bold:true,
color:{argb:"FF0D6EFD"}
};

sheet.getCell("A1").alignment = {
horizontal:"center",
vertical:"middle"
};

sheet.addRow([]);

/* رؤوس الأعمدة */

const headers = [
"رقم الأصل",
"الصنف",
"العدد",
"القيمة",
"الإهلاك %",
"القيمة بعد الإهلاك",
"التاريخ",
"الحالة",
"الصورة"
];

const headerRow = sheet.addRow(headers);

headerRow.eachCell(cell => {

cell.font = {bold:true,color:{argb:"FFFFFFFF"}};

cell.fill = {
type:"pattern",
pattern:"solid",
fgColor:{argb:"FF0D6EFD"}
};

cell.alignment = {
horizontal:"center",
vertical:"middle"
};

});

/* قراءة البيانات */

const tx = db.transaction("assets","readonly");

const store = tx.objectStore("assets");

store.openCursor().onsuccess = async e => {

const cursor = e.target.result;

if(cursor){

const i = cursor.value;

const row = sheet.addRow([
i.assetId,
i.name,
i.quantity,
i.value,
i.depreciation,
i.finalValue,
i.date,
i.condition,
""
]);

row.height = 60;

/* إضافة الصورة */

if(i.image){

const imageId = workbook.addImage({
base64: i.image,
extension: "png"
});

sheet.addImage(imageId,{
tl:{col:8,row:row.number-1},
ext:{width:60,height:60}
});

}

row.eachCell(cell=>{
cell.alignment = {
horizontal:"center",
vertical:"middle"
};
});

cursor.continue();

}

else{

sheet.columns = [
{width:15},
{width:20},
{width:10},
{width:12},
{width:12},
{width:20},
{width:15},
{width:15},
{width:20}
];

/* إنشاء الملف */

const buffer = await workbook.xlsx.writeBuffer();

const blob = new Blob(
[buffer],
{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
);

const link = document.createElement("a");

link.href = URL.createObjectURL(blob);

link.download = "تقرير_الأصول.xlsx";

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

}

};

}