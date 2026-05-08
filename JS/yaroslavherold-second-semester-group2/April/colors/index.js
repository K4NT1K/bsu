const rgb = new RGB()
const cmy = new CMY()

const eventBus = {
    arr: [],

    subscribe(fn) {
        this.arr.push(fn)
    },

    emit() {
        this.arr.forEach((fn) => fn())
    },
}

// rgb.setR(123)
// eventBus.emit()

// console.log(rgb, cmy)

const renderer = new Renderer(document.querySelector('#colors-container'))
renderer.addSchema(rgb)
renderer.addSchema(cmy)
renderer.renderInputs()
renderer.renderBgColor()