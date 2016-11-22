'use strict'
$(document).ready(() => {
  $('.btn-primary').on('click', (event) => {
    event.preventDefault()

    const file1 = $('input#inputone').get(0).files[0]
    const file2 = $('input#inputtwo').get(0).files[0]

    if (file1) {
      $('div.imgareaselect-outer').remove()
      $('section').next().remove()
      showImage(file1, "one")
    }

    if (file2) {
      $('div.imgareaselect-outer').remove()
      $('section').next().remove()
      showImage(file2, "two")
    }
  })

  $('#create').on('click', (event) => {
    const c = document.getElementById("myCanvas");
    const ctx = c.getContext("2d");

    const img1 =  document.getElementById("one");
    // const img2 = document.getElementById("two")
    //
    c.setAttribute('width', img1.width)
    c.setAttribute('height', img1.height)
    //
    const one = $('img#one').imgAreaSelect({ instance: true })
    const select1 = one.getSelection()

    const two = $('img#two').imgAreaSelect({ instance: true })
    const select2 = two.getSelection()
    //
    ctx.drawImage(img1, 0, 0);

    var img2 = new Image();
    img2.onload = function () {
        roundedImage(ctx, select1.x1, select1.y1, select1.width, select1.height, select1.width/2);
        ctx.clip();
        ctx.drawImage(img2, select2.x1, select2.y1, select2.width, select2.height, select1.x1, select1.y1, select1.width, select1.height);
    }
    img2.src = $('img#two').attr('src');
  })
})

const roundedImage = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

const showImage = (file, id) => {
  var img = document.createElement("img");
  img.setAttribute('id', id)
  img.classList.add("obj");
  img.file = file;
  $(`img#${id}`).replaceWith(img); // Assuming that "preview" is the div output where the content will be displayed.

  var reader = new FileReader();
  reader.onload = ((aImg) => {
    return (e) => {
      aImg.src = e.target.result;
    };
  })(img);
  reader.onloadend = processFile;
  reader.readAsDataURL(file);

}

const processFile = (event) => {
  var content = event.target.result;
  sendFileToCloudVision(content.replace('data:image/jpeg;base64,', ''));
}

const sendFileToCloudVision = (content) => {
  var request = {
    requests: [{
      image: {
        content: content
      },
      features: [{
        type: "FACE_DETECTION",
        maxResults: 1
      }]
    }]
  };

  $.post({
    url: 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyClSChTezpZHiUSsJ2arxZfz8EMMK-n0Pg',
    data: JSON.stringify(request),
    contentType: 'application/json'
  }).fail(function (jqXHR, textStatus, errorThrown) {
    $('#results').text('ERRORS: ' + textStatus + ' ' + errorThrown);
  }).done(showFaces);
}

const showFaces = (data) => {
  const contents = JSON.stringify(data, null, 4);
  const face = data.responses[0].faceAnnotations[0].boundingPoly.vertices
  const faceParameters = {
    x1: face[0].x,
    y1: face[0].y,
    x2: face[2].x,
    y2: face[2].y,
    persistent: true,
    handles: "corners"
  }

  if ($('input#inputone').get(0).files[0]) {
    $('img#one').imgAreaSelect(faceParameters)
  }

  if ($('input#inputtwo').get(0).files[0]) {
    $('img#two').imgAreaSelect(faceParameters)
  }
}
