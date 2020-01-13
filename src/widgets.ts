import { Widget, } from "@phosphor/widgets";


export
class OpenTemplateWidget extends Widget {
  constructor() {
    const body = document.createElement("menu");
    const label = document.createElement("label");
    label.textContent = "Choose a template:";

    const input = document.createElement("select");
    body.appendChild(label);
    body.appendChild(input);
    super({ node: body });
  }

  public getValue(): string {
    return this.inputNode.value;
  }

  get inputNode(): HTMLSelectElement {
    return this.node.getElementsByTagName("select")[0] as HTMLSelectElement;
  }
}

export
class AddSourceWidget extends Widget {
  constructor() {
    const body = document.createElement("menu");

    const address_label = document.createElement("label");
    address_label.textContent = "Source Address:";
    const address_input = document.createElement("input");
    body.appendChild(address_label);
    body.appendChild(address_input);

    const name_label = document.createElement("label");
    name_label.textContent = "Source Name:";
    const name_input = document.createElement("input");
    body.appendChild(name_label);
    body.appendChild(name_input);

    const type_label = document.createElement("label");
    type_label.textContent = "Source Name:";
    const type_select = document.createElement("select");
    for (let t of ['notebook', 'markdown', 'text']) {
      const val = document.createElement("option");
      val.label = t ;
      val.text  = t;
      val.value = t;
      type_select.appendChild(val);
    }
    body.appendChild(type_label);
    body.appendChild(type_select);
    super({ node: body });
  }

  public getValue(): {[key:string] : string} {
    return {
      'address': this.inputNodes[0].value,
      'name': this.inputNodes[1].value,
      'type': this.selectNode.value
    };
  }

  get selectNode(): HTMLSelectElement {
    return this.node.getElementsByTagName("select")[0] as HTMLSelectElement;
  }

  get inputNodes(): HTMLCollectionOf<HTMLInputElement> {
    return this.node.getElementsByTagName("input"); //HTMLInputElement;
  }
}
