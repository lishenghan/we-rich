'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.splitHead = splitHead;
exports.unquote = unquote;
exports.format = format;
exports.formatAttributes = formatAttributes;

function splitHead(str, sep) {
    var idx = str.indexOf(sep);
    if (idx === -1) return [str];
    return [str.slice(0, idx), str.slice(idx + sep.length)];
}

function unquote(str) {
    var car = str.charAt(0);
    var end = str.length - 1;
    var isQuoteStart = car === '"' || car === "'";
    if (isQuoteStart && car === str.charAt(end)) {
        return str.slice(1, end);
    }
    return str;
}

function format(nodes, options) {
    return nodes.map(function (node) {
        if (node.attributes != undefined) {
            const attr = node.attributes.join(",");
            if (attr.indexOf("text-decoration") > -1) {
                node = getUnderline(node);
            }
        }

        var type = node.type;
        if (type === 'element') {
            var tagName = node.tagName.toLowerCase();
            var name = options.supportTags.indexOf(tagName) >= 0 ? tagName : 'div';
            var attributes = formatAttributes(node.attributes);
            var children = format(node.children, options);
            return { type: 'node', name: name, attrs: attributes, children: children };
        }

        if (type === 'text') {
            /*node.content = getUnderline(node.content);*/
            return { type: 'text', text: node.content };
        }
        return null;
    }).filter(function (i) {
        return i;
    });
    // 小程序只支持 node 和 text节点. comment要过滤掉
}


function getUnderline(node) {
    for (let childNode of node.children) {
        if (childNode.type === "element") {
            for(let subChildNode of childNode.children) {
                const content = subChildNode.content;
                let nodeContent = "";
                if (content!= undefined && content != null) {
                    const blockList = content.split("&nbsp;");
                    for (let block of blockList) {
                        if (block.trim() === '') {
                            nodeContent += "_";
                        } else {
                            nodeContent += block;
                        }
                    }
                    subChildNode.content = nodeContent;
                }
            }
        } else {
            const content = childNode.content;
            let nodeContent = "";
            if (content!= undefined && content != null) {
                const blockList = content.split("&nbsp;");
                for (let block of blockList) {
                    if (block.trim() === '') {
                        nodeContent += "_";
                    } else {
                        nodeContent += block;
                    }
                }
                childNode.content = nodeContent;
            }
        }
    }

    return node;
}

function formatAttributes(attributes, name) {
    const imgRoot = wx.getStorageSync("imgRoot");
    let isHasStyle = false;
    var attrs = {};
    attributes.map(function (attribute) {
        var parts = splitHead(attribute.trim(), '=');
        var key = parts[0];
        var value = typeof parts[1] === 'string' ? unquote(parts[1]) : null;
        if (key === 'src' && !value.startsWith("http")) {
            value = imgRoot+value;
        }
        if (key === 'style') {
            // 设置下划线
            if (value.indexOf("text-decoration") > -1) {
                value = value.replace("text-decoration:underline;", "");
            }
            // 设置图片最大宽度
            value = value.endsWith(";") ?  value+" max-width:100%;" :  value+"; max-width:100%;height:auto;";
            // 设置表格边框
            if (name === "table") {
                value += " border-collapse:collapse;width:100%;margin: 10px 0;";
            }
            isHasStyle = true;
        }
        attrs[key] = value;
        return { key: key, value: value };
    });
    if ((name === "img" || name === "table") && !isHasStyle) {
        attrs['style'] = "max-width:100%;";
        if (name === "table") {
            attrs['style'] += " border-collapse:collapse;width:100%;margin: 10px 0;";
        }
    }
    if((name === "td")) {
        attrs['style'] = "border:1px solid #ddd; padding-left:10px;";
    }
    return attrs;
}
//# sourceMappingURL=format.js.map
