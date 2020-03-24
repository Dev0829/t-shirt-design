var canvas = new fabric.Canvas('canvas');
var canvasCenter;

$(function() {
    $("#image").on("change", function()
    {
        var files = !!this.files ? this.files : [];
        if (!files.length || !window.FileReader) return;
        if (/^image/.test( files[0].type)){
            var reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onloadend = function(){
                fabric.Image.fromURL(this.result, function(myImg) {
                    var img1 = myImg.set({ left: 205, top: 210, scaleX: 150/myImg.width, scaleY: 150/myImg.height, clipName: 'layer',
                    clipTo: function(ctx) {
                        return _.bind(clipByName, img1)(ctx)
                    } });
                    canvas.add(img1); 
                });
            }
        }
    });
});

$(function() {
    $("#upload-background").on("change", function()
    {
        var files = !!this.files ? this.files : [];
        if (!files.length || !window.FileReader) return;
        if (/^image/.test( files[0].type)){
            var reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onloadend = function(){
                fabric.Image.fromURL(this.result, function(myImg) {
                    canvas.setHeight(canvas.getWidth() * myImg.height / myImg.width);
                    canvas.setBackgroundImage(myImg, canvas.renderAll.bind(canvas), {
                        scaleX: canvas.getWidth()/myImg.width,
                        scaleY: canvas.getHeight()/myImg.height
                    });
                    $("#UploadModal").modal("toggle");
                });
                addCanvas();
            }
        }
    });

});

function clipByName(ctx) {
    this.setCoords();
    var clipRect = findByClipName(this.clipName);
    var scaleXTo1 = (1 / this.scaleX);
    var scaleYTo1 = (1 / this.scaleY);
    ctx.save();

    var ctxLeft = -(this.width / 2) + clipRect.strokeWidth;
    var ctxTop = -(this.height / 2) + clipRect.strokeWidth;
    var ctxWidth = clipRect.width - clipRect.strokeWidth;
    var ctxHeight = clipRect.height - clipRect.strokeWidth;

    ctx.translate(ctxLeft, ctxTop);
    ctx.scale(scaleXTo1, scaleYTo1);
    ctx.rotate(degToRad(this.angle * -1));

    ctx.beginPath();
    ctx.rect(
        clipRect.left - this.oCoords.tl.x,
        clipRect.top - this.oCoords.tl.y,
        clipRect.width,
        clipRect.height
    );
    ctx.closePath();
    ctx.restore();
}



function findByClipName(name) {
    return _(canvas.getObjects()).where({
        clipFor: name
    })[0]
}

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

canvas.on('object:moving', function() {
    var obj = canvas.item(canvas.getObjects().length-1);
    var bounds = findByClipName("layer");
    obj.setCoords();
    if(!obj.isContainedWithinObject(bounds)){
        obj.set({top: parseInt(goodtop)});
        obj.set({left: parseInt(goodleft)});
        canvas.renderAll();    
    } else {
        goodtop = obj.top;
        goodleft = obj.left;
    } 
    showUpdates();
});

canvas.on('object:scaling', function() {
    showUpdates();
});

canvas.on('object:selected', function() {
    showUpdates();
});

canvas.on('object:rotating', function() {
    showUpdates();
});

function showUpdates(){
    var activeObject = canvas.item(canvas.getObjects().length-1);
    $(".design_x_position").val(activeObject.get('left').toFixed(2));
    $(".design_y_position").val(activeObject.get('top').toFixed(2));
    $(".size_design_width").val((activeObject.get('scaleX')*activeObject.get('width')).toFixed(2));
    $(".size_design_height").val((activeObject.get('scaleY')*activeObject.get('height')).toFixed(2));
}

function updateCanvasImage(){
    var width = $(".size_design_width").val();
    var height = $(".size_design_height").val();
    var left = $(".design_x_position").val();
    var top = $(".design_y_position").val();

    MyObject= canvas.getObjects()[0];

    if (width)
        MyObject.set({scaleX: width / MyObject.get("width")});
    
    if (height)
        MyObject.set({scaleY: height / MyObject.get("height")});
    
    if (left)
        MyObject.set({left: parseInt(left)});

    if (top)
        MyObject.set({top: parseInt(top)});

    canvas.renderAll();
    console.log((MyObject.get('left') + MyObject.get('scaleX')*MyObject.get('width')/2), (MyObject.get('top') + MyObject.get('scaleY')*MyObject.get('height')/2));
    canvasCenter = new fabric.Point((MyObject.get('left') + MyObject.get('scaleX')*MyObject.get('width')/2), (MyObject.get('top') + MyObject.get('scaleY')*MyObject.get('height')/2));
}

function addCanvas(){
    var clipRectangle = new fabric.Rect({
            originX: 'left',
            originY: 'top',
            left: 180,
            top: 180,
            width: 200,
            height: 230,
            fill: 'transparent',
            strokeWidth: 1,
            stroke: 'blue',
            hasControls: false,
            selectable: false
        });
        clipRectangle.set({
            clipFor: 'layer'
        });
        canvas.add(clipRectangle);
}

$(".save").on("click", function(){

    var byteData = document.getElementById("save");
    var object = canvas.item(canvas.getObjects().length-2);
    object['visible'] = false;
    byteData.href = canvas.toDataURL('image/jpeg', 1.0);
    byteData.download = "download.jpg"
    object['visible'] = true;

    // $.ajax({
 //          type: "POST",
 //          url: "",
 //          data: {"byteData":byteData,"imageName":"test.jpg" },
 //          success: function (response) {
 //            if(response=='error')
 //            {
 //              alert("OK");
 //            }else
 //            {
 //              var getimgurl='';
 //              $('#ideaimage').prop('src',getimgurl);
 //            }
 //          },
 //        });

})

$("#UploadModal").modal("toggle");