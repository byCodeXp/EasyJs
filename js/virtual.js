const eNode = (tagName, props = {}, children = []) => {
    return {
        tagName,
        props,
        children,
    };
};

function virtual(node) {
    let nodeElements = [];
    let elements = node.querySelectorAll("*");

    if (elements.length === 0) {
        return node.innerHTML;
    }

    for (let element of node.querySelectorAll("*")) {
        if (element.parentNode === node) {
            let newNode = eNode(element.tagName);
            for (const p of element.attributes) {
                newNode.props[p.name] = p.value;
            }
            newNode.children = virtual(element);
            nodeElements.push(newNode);
        }
    }
    return nodeElements;
}

function demount(node) {
    let newNode = eNode(node.tagName);
    for (const p of node.attributes) {
        newNode.props[p.name] = p.value;
    }
    newNode.children = virtual(node);
    return newNode;
}