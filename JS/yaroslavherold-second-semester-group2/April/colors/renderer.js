class Renderer {
    /**
     * @description Color schemas to render
     * @type {ColorSchema[]}
     */
    schemas = []

    constructor(root) {
        this.root = root
    }

    addSchema(schema) {
        this.schemas.push(schema)

        const div = document.createElement('div')

        const header = document.createElement('h2')
        header.textContent = schema.name
        div.append(header)

        for (const field of schema.fields) {
            const label = document.createElement('label')
            label.textContent = field.name.toUpperCase()
            const input = document.createElement('input')
            input.id = `${schema.name}_${field.name}`
            input.addEventListener('input', (e) => {
                field.onInput(+e.target.value)
                for (const s of this.schemas) {
                    s.fromRGB(schema.toRGB())
                }
                this.renderBgColor()
                this.renderInputs()
            })
            label.append(input)
            div.append(label)
            div.append(document.createElement('br'))
        }

        this.root.append(div)
    }

    renderInputs() {
        this.schemas.forEach((schema) => {
            schema.fields.forEach((field) => {
                const input = document.querySelector(`#${schema.name}_${field.name}`)
                input.value = field.getValue()
            })
        })
    }

    renderBgColor() {
        const { r, g, b } = this.schemas[0].toRGB()
        document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
    }
}