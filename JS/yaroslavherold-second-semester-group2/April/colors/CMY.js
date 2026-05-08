class CMY extends ColorSchema {
    #c
    #m
    #y

    constructor(c = 0, m = 0, y = 0) {
        super('CMY')
        this.fields = [
            { name: 'c', onInput: (value) => this.setC(value), getValue: () => this.#c },
            { name: 'm', onInput: (value) => this.setM(value), getValue: () => this.#m },
            { name: 'y', onInput: (value) => this.setY(value), getValue: () => this.#y },
        ]

        this.#c = c
        this.#m = m
        this.#y = y
    }

    setCMY(c, m, y) {
        this.#c = c
        this.#m = m
        this.#y = y
    }

    setC(c) {
        this.#c = c
    }

    setM(m) {
        this.#m = m
    }

    setY(y) {
        this.#y = y
    }

    get c() {
        return this.#c
    }
    get m() {
        return this.#m
    }
    get y() {
        return this.#y
    }

    toRGB = () => ({ r: 255 - this.#c, g: 255 - this.#m, b: 255 - this.#y })
    fromRGB = ({ r, g, b }) => {
        this.#c = 255 - r
        this.#m = 255 - g
        this.#y = 255 - b
    }
}