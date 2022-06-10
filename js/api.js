
const loadImg = () => {
  const dataUrl = localStorage.getItem('Base64string');

  let img = new Image();
  img.onload = function () {
    var canvas = document.querySelector('.board')
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  }
  img.src = dataUrl
}

const saveImg = () => {
  var canvas = document.querySelector('.board');
  var link = document.createElement('a');
  link.download = "download.png";
  link.href = canvas.toDataURL();
  link.click();

};

loadImg();

document.querySelector('.btn-save').addEventListener('click', () => {
  saveImg()
})


class paint {
  constructor() {
    this.canvas = document.querySelector('.board');
    this.ctx = this.canvas.getContext('2d');

    this.color = 'back';
    this.tool;
    this.lineWidth = 2;
    this.currentPos = {
      x: 0,
      y: 0
    };
    this.lineStartPos = {
      x: 0,
      y: 0
    }
    this.coodsMouse = {
      x: 0,
      y: 0
    }
    this.drawing = false;
    this.arr = [];
    this.index = -1;
    this.image = new Image();
    this.image.src = localStorage.getItem('Base64string');
    this.newImg = null;
    this.hasInput = false;
    this.inputValue;
    this.startMouse = (e) => this.mouseDown(e);
    this.moveMouse = (e) => this.mouseMove(e);
    this.end = (e) => this.mouseUp(e);
    this.clickFillText = (e) => this.click(e);
  }
  listenEvent() {
      this.canvas.addEventListener('mousedown', this.startMouse);
      this.canvas.addEventListener('mousemove', this.moveMouse);
      this.canvas.addEventListener('mouseup', this.end);
  }
  listenClick() {
      this.canvas.addEventListener('click', this.clickFillText)
  }
  removeEventMouse() {
    this.canvas.removeEventListener('mousedown',this.startMouse);
    this.canvas.removeEventListener('mousemove', this.moveMouse);
    this.canvas.removeEventListener('mouseup', this.end);
    this.canvas.removeEventListener('click', this.clickFillText)
  }
  getMousePos(evt) {
    var rect = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
    // console.log(evt.clientX);
    // console.log(rect.left);
  }

  click(e) {
    if(document.querySelector('.inputText')) {
      if(document.querySelector('.inputText').value) {
        this.drawText(document.querySelector('.inputText').value);
      }
      document.querySelector('.inputText').remove();
      return
    }
    // if (this.hasInput) return;
    this.coodsMouse = this.getMousePos(e);
    this.addInput(e.clientX, e.clientY);
  }

  mouseDown(event) {
    event.preventDefault()
    this.drawing = true;
    this.lineStartPos = this.getMousePos(event);
  }

  mouseMove(event) {
    event.preventDefault()
    let mousePos = this.getMousePos(event);
    if (this.drawing) {
      switch (this.tool) {
        case 'pen':
          this.drawLine(this.currentPos, mousePos)
          break
        case 'line':
          this.undoOne();
          this.drawLine(this.lineStartPos, mousePos);
          break
        case 'square':
          this.undoOne();
          this.drawSquare(this.lineStartPos, mousePos);
          break
        case 'circle':
          this.undoOne();
          this.drawCircle(this.lineStartPos, mousePos);
          break
      }
    }
    this.currentPos = mousePos;
  }

  mouseUp(event) {
    event.preventDefault()
    this.saveState();
    this.drawing = false;
  }

  drawLine(startPos, endPos) {
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = this.color;
    this.ctx.beginPath();
    this.ctx.moveTo(startPos.x, startPos.y);
    this.ctx.lineTo(endPos.x, endPos.y);
    this.ctx.stroke();
  }
  drawSquare(startPos, endPos) {
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = this.color;
    this.ctx.beginPath();
    this.ctx.rect(startPos.x,
      startPos.y,
      endPos.x - startPos.x,
      endPos.y - startPos.y);
    this.ctx.stroke();
  }
  addInput(x, y) {
    var input = document.createElement('input');
    input.classList.add('inputText');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.background = 'transparent';
    input.border = 'none';
    input.style.left = x + 'px';
    input.style.top = y + 'px';
    document.body.appendChild(input);
    input.focus();
    // this.hasInput = true;
    input.addEventListener('keydown', (e) => {
      var keyCode = e.keyCode;
      if (keyCode === 13) {
        if(input.value) {
          this.drawText(input.value);
        }
        document.body.removeChild(input);
        // this.hasInput = false;
      }
    })
  }
  //Draw the text onto canvas:
  drawText(txt) {
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'left';
    this.ctx.font = '24px sans-serif';
    this.ctx.fillStyle = this.color;
    this.ctx.fillText(txt, this.coodsMouse.x , this.coodsMouse.y);
    this.saveState();
  }

  saveState() {
    this.image = new Image();
    this.image.src = this.canvas.toDataURL();
    this.arr.push(this.image.src);
    this.index++;
    this.canvas.removeEventListener('mousedown', (event) => this.mouseDown(event));
    this.canvas.removeEventListener('mousemove', (event) => this.mouseMove(event));
    this.canvas.removeEventListener('mouseup', (event) => this.mouseUp(event));
  }
  undoOne() {
    if (this.index < 0) {
      this.image = new Image();
      this.image.src = localStorage.getItem('Base64string');
      this.ctx.drawImage(this.image, 0, 0);
    } else {
      this.ctx.drawImage(this.image, 0, 0);
    }
  }
  undo() {
    if (this.index >= 0) {
      this.index--;
      if (this.index < 0) {
        loadImg()
      }
      else {
        this.newImg = new Image();
        this.newImg.onload = () => {
          this.ctx.drawImage(this.newImg, 0, 0);
        }
        this.newImg.src = this.arr[this.index];
        this.image.src = this.arr[this.index];
      }
    }
  }
  redo() {
    if (this.index < this.arr.length - 1) {
      this.index++;
      this.newImg = new Image();
      this.newImg.onload = () => {
        this.ctx.drawImage(this.newImg, 0, 0);
      }
      this.newImg.src = this.arr[this.index];
      this.image.src = this.arr[this.index];
    }
  }
  clearAll() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.image = new Image();
    this.image.src = localStorage.getItem('Base64string');
    loadImg();
    this.arr = [];
    this.index = -1;
  }
}

var p = new paint();

const pen = document.querySelector('.pencil');
const line = document.querySelector('.line');
const square = document.querySelector('.square');
const text = document.querySelector('.text');
const board = document.querySelector('.board');
const colorRga = 'rgba(33, 27, 66, 0.2)';
const colorTransparent = 'transparent';

pen.addEventListener('click', () => {
  if (p.tool === 'pen') {
    p.tool = 'none';
    p.removeEventMouse()
    pen.style.background = colorTransparent;
    board.classList.remove('cursor-pen');
  } else {
    p.removeEventMouse();
    p.tool = 'pen';
    p.listenEvent();
    pen.style.background = colorRga;
    line.style.background = colorTransparent;
    square.style.background = colorTransparent;
    text.style.background = colorTransparent;
    board.classList.add('cursor-pen');
    board.classList.remove('cursor-text');
    board.classList.remove('cursor-square');
    board.classList.remove('cursor-line');
  }
})

line.addEventListener('click', () => {
  if (p.tool === 'line') {
    p.tool = 'none'
    p.removeEventMouse()
    line.style.background = colorTransparent;
    board.classList.remove('cursor-line');
  } else {
    p.removeEventMouse()
    p.tool = 'line';
    p.listenEvent();
    pen.style.background = colorTransparent;
    line.style.background = colorRga;
    square.style.background = colorTransparent;
    text.style.background = colorTransparent;
    board.classList.add('cursor-line');
    board.classList.remove('cursor-pen');
    board.classList.remove('cursor-text');
    board.classList.remove('cursor-square');
  }
})

square.addEventListener('click', () => {
  if (p.tool === 'square') {
    p.tool = 'none';
    p.removeEventMouse();
    square.style.background = colorTransparent;
    board.classList.remove('cursor-square');
  } else {
    p.removeEventMouse()
    p.tool = 'square';
    p.listenEvent();
    pen.style.background = colorTransparent;
    line.style.background = colorTransparent;
    square.style.background = colorRga;
    text.style.background = colorTransparent;
    board.classList.remove('cursor-pen');
    board.classList.remove('cursor-text');
    board.classList.add('cursor-square');
    board.classList.remove('cursor-line');
  }
})

text.addEventListener('click', () => {
  if (p.tool === 'text') {
    p.tool = 'none';
    p.removeEventMouse();
    text.style.background = colorTransparent;
    board.classList.remove('cursor-text');
  } else {
    p.removeEventMouse()
    p.tool = 'text';
    p.listenClick();
    text.style.background = colorRga;
    pen.style.background = colorTransparent;
    line.style.background = colorTransparent;
    square.style.background = colorTransparent;
    board.classList.remove('cursor-pen');
    board.classList.add('cursor-text');
    board.classList.remove('cursor-square');
    board.classList.remove('cursor-line');
  }
})

document.querySelector('.chooseColor').addEventListener('change', () => {
  p.color = document.querySelector('.chooseColor').value;
})

document.querySelector('.chooseLine').addEventListener('click', () => {
  p.lineWidth = Number(document.querySelector('.chooseLine').value);
})

document.querySelector('.undo').addEventListener('click', () => {
  p.undo()
})

document.querySelector('.redo').addEventListener('click', () => {
  p.redo()
})

document.querySelector('.clearAll').addEventListener('click', () => {
  p.clearAll();
})
document.querySelector('.btn-done').addEventListener('click', () => {
  let canvas = document.querySelector('.board-done');
  let ctx = canvas.getContext('2d');
  canvas.width = p.image.width
  canvas.height = p.image.height
  let img = new Image();
  if (p.index < 0 || p.arr.length === 0) {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    }
    img.src = localStorage.getItem('Base64string');
  } else {
    ctx.drawImage(p.image, 0 ,0);
  }
  // add scroll Y
  if(p.image.height > 937) {
    document.querySelector('.doneImg').classList.add('scrollY');
  }
  // check element input, true => remove
  var check = document.querySelector('.inputText');
  if(check) {
    check.remove();
    p.hasInput = false;
  }

  // on-off modal
  document.querySelector('.main-edit').style.display = 'none';
  document.querySelector('.main-display').style.display = 'block';
});

document.querySelector('.back-edit').addEventListener('click', () => {
  document.querySelector('.main-edit').style.display = 'block';
  document.querySelector('.main-display').style.display = 'none';
})

document.querySelector('.increase').addEventListener('click', () => {
  const percenCurrent =  document.querySelector('.percen').innerHTML;
  var result = Number(percenCurrent) + 20;
  if(result <= 180) {
    document.querySelector('.percen').innerHTML = result;
  }
})

document.querySelector('.decrease').addEventListener('click', () => {
  const percenCurrent =  document.querySelector('.percen').innerHTML;
  var result = Number(percenCurrent) - 20;
  if(result >= 20) {
    document.querySelector('.percen').innerHTML = result;
  }
})




