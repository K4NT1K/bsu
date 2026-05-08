class ColorSchema {
    name = ''
    fields = []

    constructor(name) {
        this.name = name
    }

    toRGB() {
        throw new Error('not implemented')
    }

    fromRGB(rgb) {
        throw new Error('not implemented')
    }
}