

let isMouseDown = false;
document.addEventListener("mousedown", () => {isMouseDown = true;console.log(true)});
document.addEventListener("mouseup", () => {isMouseDown = false;console.log(false)});
var boxes;

class Matrix {
    static matrixBoxIds = [];

    constructor(mainBoxId, x, y, config = {}) {
        this.mainBoxId = mainBoxId;
        this.x = x;
        this.y = y;
        this.MATRIX = [];

        var {
            initialValue = 1,
            padding = 1,
            showGUIControls = false,
            kernel = Kernels.gaussianBlur,
            showPixelValue = false,
            pixelSize = 20,
            fillStyle = "toggle-pixels"
        } = config;

        this.initialValue = initialValue;
        this.padding = padding;
        this.showGUIControls = showGUIControls;
        this.kernel = kernel;
        this.showPixelValue = showPixelValue;
        this.pixelSize = pixelSize;
        this.fillStyle = fillStyle;
        // this.currentDragFunction
    }

    makeMatrix() {
        if (Matrix.matrixBoxIds.includes(this.mainBoxId)) {
            alert("Two matrix can't be in same container!");
            throw new Error("Two matrix can't be in same container.");
        }
        Matrix.matrixBoxIds.push(this.mainBoxId);

        var mainBox = document.getElementById(this.mainBoxId);
        if (mainBox == undefined) {
            mainBox = document.createElement("section");
            mainBox.setAttribute("id", this.mainBoxId);
            document.body.appendChild(mainBox);
        }
        

        var matrixBox = document.createElement("div");
        matrixBox.setAttribute("id", this.mainBoxId+"Matrix");

        for (let i = 1; i <= this.x; i++) {
            let row = document.createElement("span");
            row.setAttribute("id", `${this.mainBoxId}Row${i}`);

            let matrixRow = [];

            for (let j = 1; j <= this.y; j++) {
                let pixel = document.createElement("span");
                pixel.setAttribute("id", `${this.mainBoxId}${i},${j}`);
                pixel.innerHTML = (this.showPixelValue) ? this.initialValue : "";
                pixel.style.backgroundColor = this.getColor(this.initialValue);
                console.log( this.getColor(this.initialValue))
                // pixel.addEventListener('contextmenu', e => {
                //     e.preventDefault();
                //     this.togglePixel(e);
                // });

                row.appendChild(pixel);
                matrixRow.push(this.initialValue);
            }
            matrixBox.appendChild(row);
            this.MATRIX.push(matrixRow);
        }
        
        mainBox.appendChild(matrixBox);

        if (this.showGUIControls) this.showControls();

        // enabling drag feature 
        this.updateDragFeature();

}

    updateDragFeature() {
        boxes = document.querySelectorAll('[id*="Matrix"] [id*="Row"] span');
        boxes.forEach(box => {
            box.addEventListener("mousedown", (e) => this.dragPixelsFunction(e));
            box.addEventListener("mouseover", (e) => {
                if (isMouseDown) {
                    this.dragPixelsFunction(e);
                }
            });
        });

    }

    dragPixelsFunction(eventParam) {
        let dragFunction;
        switch (this.fillStyle) {
            case "toggle-pixels":
                dragFunction = (e) => this.togglePixel(e);
                break;
            case "default-pixels":
                dragFunction = (e) => this.updateColor(e.target.id, this.initialValue);
                break;
            case "black-pixels":
                dragFunction = (e) => this.updateColor(e.target.id, 0);
                break;
            case "white-pixels":
                dragFunction = (e) => this.updateColor(e.target.id, 1);
                break;
            default:
                break;
        }
        return dragFunction(eventParam)
    }

    getPixelColor(id) {
        if (typeof(id) == "object") {
            id= this.mainBoxId + id[0] + "," + id[1];
        }
        return this.MATRIX[this.getLocation(id)[0]-1][this.getLocation(id)[1]-1];
    }

    showControls() {
        // filter btn
        let applyFilterBtn = document.createElement("button");
        applyFilterBtn.setAttribute("id", this.mainBoxId+"ApplyFilterBtn");
        applyFilterBtn.setAttribute("class", this.mainBoxId+"-matrix-control-button");
        applyFilterBtn.setAttribute("type", "button");
        applyFilterBtn.innerHTML = "Apply Filter";
        applyFilterBtn.addEventListener("click", this.convolve.bind(this, this.kernel));

        // clear btn
        let clearBtn = document.createElement("button");
        clearBtn.setAttribute("id", this.mainBoxId+"ClearBtn");
        clearBtn.setAttribute("class", this.mainBoxId+"-matrix-control-button");
        clearBtn.setAttribute("type", "button");
        clearBtn.innerHTML = "Clear";
        clearBtn.addEventListener("click", this.clear.bind(this));

        // toggle pixel data visibility
        let pixelDataVisibilityControl = document.createElement("div");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = this.mainBoxId + "ShowPixelValueCheckbox";
        checkbox.style.marginLeft = "8px";
        checkbox.style.marginTop = ".36rem";
        let label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.innerText = "Show Pixel Values";
        label.style.marginLeft = "5px";

        checkbox.checked = this.showPixelValue;
        checkbox.addEventListener("change", (e) => {
            this.showPixelValue = e.target.checked;
            this.updatePixelDataVisibility()
        });
        pixelDataVisibilityControl.appendChild(checkbox);
        pixelDataVisibilityControl.appendChild(label);


        // Drag Style 
        const dropdownComponent = UIComponents.createFillWithDropdown((selectedValue) => {
            console.log("User selected:", selectedValue);
            this.fillStyle = selectedValue;
        });

        
        // pixel size controls
        let pixelSizeControls = UIComponents.createPixelSizeController(this.resiszePixels.bind(this));





        document.getElementById(this.mainBoxId).appendChild(applyFilterBtn);
        document.getElementById(this.mainBoxId).appendChild(clearBtn);
        document.getElementById(this.mainBoxId).appendChild(pixelDataVisibilityControl);
        document.getElementById(this.mainBoxId).appendChild(pixelSizeControls);
        document.getElementById(this.mainBoxId).appendChild(dropdownComponent);
    }

    updateMatrix(x, y, value) {
        this.MATRIX[x-1][y-1] = value;
        // console.log(this);
        // console.table(this.MATRIX);
    }

    getLocation(point) {
        return point.slice(this.mainBoxId.length, point.length).split(',').map(coord => {return parseInt(coord)});
    }

    togglePixel(e) {
        let [x, y] = this.getLocation(e.target.id);
        let val = (this.MATRIX[x-1][y-1] == 0) ? 1 : 0;
        this.updateMatrix(x, y, val);

        this.updateColor(e.target.id, val);
        console.log(e.target.id)
    }

    updateColor(id, val) {
        if (typeof(id) == "object") {
            id= this.mainBoxId + id[0] + "," + id[1];
        }
        // console.log(id);
        document.getElementById(id).style.backgroundColor = this.getColor(val);

        if (this.showPixelValue) {
            document.getElementById(id).innerHTML = val;
        }
    }

    updatePixel(id, val) {
        if (typeof(id) == "object") {
            id= this.mainBoxId + id[0] + "," + id[1];
        }
        document.getElementById(id).style.backgroundColor = this.getColor(val);
        this.MATRIX[this.getLocation(id)[0]-1][this.getLocation(id)[1]-1] = val;

        if (this.showPixelValue) {
            document.getElementById(id).innerHTML = val;
        }
    }

    getColor(val) {
        if (val > 1 || val < 0) {
            console.warn("Color component of boxPixel should be between 0 and 1. You gave " + val);
            val = (val > 1) ? 1 : 0;
        }
        let component = Math.round(255*val);
        return `rgb(${component}, ${component}, ${component})`;
    }

    convolve(kernal) {
        let resultMatrix = this.MATRIX.map(row => {
            return row.map(() => 1);
        });
        let startPixel = [1, 1];
        let currPixel = [...startPixel];
        let matrixLengthX = this.MATRIX.length;
        let matrixLengthY = this.MATRIX[0].length;

        for (let i=0; i<matrixLengthX; i++) {
            for (let j=0; j<matrixLengthY; j++) {
                // console.log(9)
                currPixel = [i, j];
                let resultPixel = this.kernalSum(kernal, currPixel);
                resultPixel = this.filterResultPixel(resultPixel);
                this.updateColor(currPixel.map((c)=>c+1), resultPixel);
                resultMatrix[currPixel[0]][currPixel[1]] = resultPixel;
            }
        }

        this.MATRIX = resultMatrix;

        return resultMatrix
        // console.table(resultMatrix)
    }

    filterResultPixel(pixelSum) {
        if (pixelSum > 1) {
            return 1;
        }
        else if (pixelSum < 0) {
            return 0;
        }
        return pixelSum;
    } 

    kernalSum(kernal, pixelLocation) {
        let len = kernal.length;
        let sum = 0;
        let [x, y] = pixelLocation;
        let offset = Math.floor(len/2)

        for (let i=0; i<len; i++) {
            for (let j=0; j<len; j++) {
                if (this.isOutOfIndex([x-offset+i, y-offset+j])) {
                    sum += kernal[i][j] * this.padding;
                }
                else {
                    sum += kernal[i][j] * this.MATRIX[x-offset+i][y-offset+j];
                }
            }
        }
        // if (isNaN(sum)) {alert(pixelLocation)}
        return Math.round(sum*100)/100;
    }

    isOutOfIndex(pixelLocation) {
        if (pixelLocation.length != 2 || !Array.isArray(pixelLocation)) {
            throw new Error("Invalid argument given to isOutOfIndex function. Given arg: " + pixelLocation);
        }
        let [x, y] = pixelLocation;
        if (x >= this.x || x < 0) return true;
        else if (y >= this.y || y < 0) return true;
        else return false;
    }

    clear() {
        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                this.updateColor([i+1, j+1], this.initialValue);
                this.MATRIX[i][j] = this.initialValue;
            }
        }
    }

    updatePixelDataVisibility() {
        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                let x = i+1;
                let y = j+1;
                let id = this.mainBoxId+x+","+y;
                document.getElementById(id).innerHTML = (this.showPixelValue) ? this.MATRIX[i][j] : "";
            }
        }
    }

    // DOM features
    resiszePixels(size) {
        this.pixelSize = size;

        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                let x = i+1;
                let y = j+1;
                let id = this.mainBoxId+x+","+y;

                document.getElementById(id).style.minHeight = this.pixelSize + "px";
                document.getElementById(id).style.minWidth = this.pixelSize + "px";
                document.getElementById(id).style.maxHeight = this.pixelSize + "px";
                document.getElementById(id).style.maxWidth = this.pixelSize + "px";
            }
        }
    }



};






const UIComponents = {
    createPixelSizeController(resizePixelsFunc, initialSize = 25, step = 1) {

    let pixelSize = initialSize;
    let minSize = 10;
    let maxSize = 50;

    const container = document.createElement("div");
    container.classList.add("pixelSizeController");
    container.style.display = "inline-flex";
    container.style.alignItems = "center";
    container.style.fontFamily = "sans-serif";
    container.style.margin = "10px";

    const minusBtn = document.createElement("button");
    minusBtn.classList.add("minusBtn");
    minusBtn.type = "button";
    minusBtn.innerHTML = "&minus;";

    const sizeLabel = document.createElement("input");
    sizeLabel.value = `${pixelSize}px`;
    sizeLabel.style.fontSize = "0.92rem";
    sizeLabel.addEventListener("click", (e)=> {
        e.target.select();
    })
    sizeLabel.addEventListener("change", ()=>{
        pixelSize = this.extractFirstInteger(sizeLabel.value);
        resizePixelsFunc(pixelSize);
        sizeLabel.value = pixelSize+"px";
    })

    const plusBtn = document.createElement("button");
    plusBtn.classList.add("plusBtn");
    plusBtn.type="button";
    plusBtn.innerHTML = "&plus;";

    container.appendChild(minusBtn);
    container.appendChild(sizeLabel);
    container.appendChild(plusBtn);

    minusBtn.addEventListener("click", () => {
        if (pixelSize > minSize) {
            pixelSize -= step;
            sizeLabel.value = `${pixelSize}px`;
            resizePixelsFunc(pixelSize);
        }
    });

    plusBtn.addEventListener("click", () => {
        if (pixelSize < maxSize) {
            pixelSize += step;
            sizeLabel.value = `${pixelSize}px`;
            resizePixelsFunc(pixelSize);
        }
    });

    resizePixelsFunc(pixelSize);

    return container;
    },


    createFillWithDropdown(onChangeCallback) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.gap = "8px";
        wrapper.style.margin = "4px";

        const label = document.createElement("span");
        label.textContent = "Set which color to fill color on drag";

        const dropdown = document.createElement("select");
        dropdown.style.padding = "4px 8px";
        dropdown.style.fontSize = "0.9rem";
        dropdown.style.border = "1px solid rgb(144, 0, 96)";
        dropdown.style.borderRadius = "4px";

        const options = ["Toggle Pixels", "Default Pixels", "Black Pixels", "White Pixels"];
        options.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt.toLowerCase().replace(/\s/g, "-");
            option.textContent = opt;
            dropdown.appendChild(option);
        });

        dropdown.addEventListener("change", (e) => {
            if (onChangeCallback) onChangeCallback(e.target.value);
        });

        wrapper.appendChild(label);
        wrapper.appendChild(dropdown);

        return wrapper;
},




    extractFirstInteger(text) {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : (()=> {
        throw new Error("Invalid argument passed. No ineteger content. arg= " + text);
    });
}

}


const Kernels = {
  boxBlur: [
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9]
  ],

  gaussianBlur: [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1]
  ].map(row => row.map(x => x / 16)),

  sharpen: [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0]
  ],
  
  sharpenModified: [
    [-1, -2, -1],
    [-2, 13, -2],
    [-1, -2, -1]
  ],

  edgeDetect: [
    [1, 0, -1],
    [0, 0, 0],
    [-1, 0, 1]
  ],
};

const gaussian5x5 = [
  [1,  4,  6,  4, 1],
  [4, 16, 24, 16, 4],
  [6, 24, 36, 24, 6],
  [4, 16, 24, 16, 4],
  [1,  4,  6,  4, 1]
].map(row => row.map(val => val / 256));









function applyToBox(box){console.log("hello")}


var m = new Matrix("root", 11, 11, {padding: 1, showGUIControls: true, showPixelValue: false});
// var m2 = new Matrix("rooti", 11, 11, {padding: 0, initialValue: 0, showGUIControls: true});
m.makeMatrix();
// m2.makeMatrix();
// var kernal;
// kernal = [
//     [1/9, 1/9, 1/9],
//     [1/9, 1/9, 1/9],
//     [1/9, 1/9, 1/9]
// ]
// kernal = [
//     [1/16, 1/8, 1/16],
//     [1/8, 1/4, 1/8],
//     [1/16, 1/8, 1/16],
// ]
kernal = [
    [1, 1, 1],
    [1, -8, 1],
    [1, 1, 1]
]
// kernal = Kernels.gaussianBlur
// kernal = gaussian5x5
// m.convolve(kernal)


// makeMatrix("root", 10, 10);



// export default Matrix
// export { Kernels }