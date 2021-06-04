const eNode = (tagName, props = {}, children = []) => {
    return {
        tagName,
        props,
        children,
    };
};

function virtual(node) {
    let elements = [];
    for (let element of node.querySelectorAll("*")) {
        if (element.parentNode === node) {
            let newNode = eNode(element.tagName);
            for (const p of element.attributes) {
                newNode.props[p.name] = p.value;
            }
            newNode.children = virtual(element);
            elements.push(newNode)
        }
    }
    return elements;
}

function demount(node) {
    let newNode = eNode(node.tagName);
    for (const p of node.attributes) {
        newNode.props[p.name] = p.value;
    }
    newNode.children = virtual(node);
    return newNode;
}