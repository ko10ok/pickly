// map_locators : map loccators mapping /json.dumps
// TODO
//  - make py class for new locator

function copyToClipboard(copyTextInputLocator) {
    /* Get the text field */
    var copyText = document.getElementById(copyTextInputLocator);
    copyText.type = 'text';

    /* Select the text field */
    copyText.select();
    // copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    document.execCommand("copy");

    /* Change the input's type back to hidden */
    copyText.type = 'hidden';
}

mouse_x = 0;
mouse_y = 0;

// attach hinter
var elemDiv = document.createElement('div');
const locator_hint_window_id = 'hint-window'
elemDiv.setAttribute('id', locator_hint_window_id);
elemDiv.style.cssText = 'position:absolute;width:fit-content;height:fit-content;opacity:1;z-index:100;background:#D9D9D9;';
elemDiv.style.left = 0;
elemDiv.style.top = 0;
var locator_hint_window = document.body.appendChild(elemDiv);

// attach hinter header
var headDiv = document.createElement('div');
const locator_hint_window_header_id = 'hint-window-header'
headDiv.setAttribute('id', locator_hint_window_header_id);
headDiv.style.cssText = 'position:releative;height:fit-content;opacity:1;z-index:100;background:#BEBEBE;';
headDiv.style.width = "100%"
headDiv.style.minHeight = "5%"

let mark_sublocators = false;
headDiv.onmouseenter = function () {
    if (mark_sublocators) return
    split_head()
    mark_sublocators = true;
}
headDiv.onmouseleave = function () {
    mark_sublocators = false;
    mark_header([]);
}
locator_hint_window.appendChild(headDiv);

// atatach hinter list
var listDiv = document.createElement('div');
const locator_hint_window_list_id = 'hint-window-list'
listDiv.setAttribute('id', locator_hint_window_list_id);
listDiv.style.cssText = 'position:releative;opacity:1;z-index:100;background:#D9D9D9;overflow-y:auto';
listDiv.style.width = "100%";
listDiv.style.height = "95%";
locator_hint_window.appendChild(listDiv);

let header_text = null;

function split_head(current = null) {
    // console.log('enetereng with:', current);

    var elemDiv = document.getElementById(locator_hint_window_header_id);

    let result_text = (current !== null) ? '<span style="text-decoration: underline;">' : ''
    let part_str = ''
    let first = true;
    let header_parts = header_text.split('.')
    for (let part of header_parts) {
        let idx = header_parts.indexOf(part)

        let before = header_parts.slice(0, idx)


        let next_chain = (first ? '' : '.') + part
        let next_full_chain = before.join('.') + next_chain

        let selector_handler = !!current && part === current ? '' : 'onmouseenter="split_head(\'' + part + '\')"'
        // console.log('selhendler:', selector_handler, part, current);

        let click_handler = 'onclick="renderHints(\'' + next_full_chain + '\', save_place=true)"'

        part_str = '<span ' + click_handler + ' ' + selector_handler + ' style="cursor: pointer;">' + next_chain + '</span>';
        result_text += (current === part) ? part_str + '</span>' : part_str;
        first = false;
    }
    // console.log(result_text);
    elemDiv.innerHTML = result_text;
}

function mark_header(parts) {
    var elemDiv = document.getElementById(locator_hint_window_header_id);

    let result_text = ''
    let part_str = ''
    let first = true;
    for (let part of header_text.split('.')) {
        if (parts.includes(part)) {
            part_str = (first ? '' : '.') + '<mark>' + part + '</mark>';
            result_text += part_str;
        } else {
            part_str = (first ? '' : '.') + part;
            result_text += part_str;
        }
        first = false;
    }

    elemDiv.innerHTML = result_text
}


function make_case_element(root_list, head, po_locator, parts) {
    hash = (Math.random() + 1).toString(36).substring(7);

    // box
    var elemCaseDiv = document.createElement('div');
    const locator_hint_case = 'hint-case' + '-' + hash;
    elemCaseDiv.setAttribute('id', locator_hint_case);
    elemCaseDiv.style.cssText = 'position:releative;height:fit-content;opacity:1;z-index:100;';
    elemCaseDiv.style.margin = '10px';
    elemCaseDiv.style.minHeight = '40px';
    elemCaseDiv.onmouseenter = function (e) {
        mark_header(parts);
    };
    elemCaseDiv.onmouseleave = function (e) {
        mark_header([]);
    };
    case_holder = root_list.appendChild(elemCaseDiv)

    // head
    var elemHeadDiv = document.createElement('div');
    const locator_hint_case_head = 'hint-case-head' + '-' + hash;
    elemHeadDiv.setAttribute('id', locator_hint_case_head);
    elemHeadDiv.style.cssText = 'position:releative;width:100%;height:fit-content;opacity:1;z-index:100;background:#8B8B8B;';
    elemHeadDiv.style.wordBreak = 'break-all';
    elemHeadDiv.style.padding = '10px';

    case_holder.appendChild(elemHeadDiv).appendChild(document.createTextNode(head))

    // body
    var elemBodyDiv = document.createElement('div');
    const locator_hint_case_body = 'hint-case-body' + '-' + hash;
    elemBodyDiv.setAttribute('id', locator_hint_case_body);
    elemBodyDiv.style.cssText = 'position:releative;width:100%;height:fit-content;opacity:1;z-index:100;background:#B4B4B4;';
    elemBodyDiv.style.padding = '10px';
    elemBodyDiv.style.wordBreak = 'break-all';
    elemHeadDiv.style.left = '10px';
    po_element = case_holder.appendChild(elemBodyDiv)

    po_text_id = 'hint-case-body-text' + '-' + hash;
    po_element.innerHTML = '<span style="cursor: pointer;" onclick="copyToClipboard(\'' + po_text_id + '\')">' + po_locator + '</span>'

    var hiddenInput = document.createElement('input')
    hiddenInput.setAttribute('id', po_text_id)
    hiddenInput.value = po_locator
    hiddenInput.type = 'hidden'
    case_holder.appendChild(hiddenInput)
}


addEventListener('mousemove', (e) => {
    mouse_x = e.clientX;
    mouse_y = e.clientY;
});

function describe(element) {
    if (element != null) {
        let current = element.getAttribute('data-n');
        let parent_locator = describe(element.parentElement);

        if (current === null)
            return parent_locator;
        else
            return parent_locator + (parent_locator === '' ? '' : '.') + current;
    } else
        return ''
}


function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

let make_new_class_id = 'make_new_class_id';

function make_py_class(element_description){
    let parts = element_description.split('.');
    let locator = parts[parts.length - 1];
    let class_name = locator.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
    console.log(element_description, locator, class_name);

    // TODO make syntax highlight https://highlightjs.org/download/
    let text = 'from helpers import WebElement<br>' +
        '<br>' +
        '<br>' +
        'class ' + class_name + '(WebElement):<br>' +
        '&nbsp&nbsp&nbsp&nbspLOCATOR = make_locator(\'' + locator + '\')';
    return text
}

function printOut(element_description, all_cases) {
    // TODO clean up
    let head = document.getElementById(locator_hint_window_header_id);
    head.innerText = element_description;
    head.style.verticalAlign = 'center';
    head.style.padding = '10px'

    header_text = element_description

    let elemDiv = document.getElementById(locator_hint_window_list_id);
    removeAllChildNodes(elemDiv);

    if (all_cases.length === 0) {
        // no PO class in python WebBricks
        let elemNewPyClassDiv = document.createElement('div');
        elemNewPyClassDiv.setAttribute('id', make_new_class_id);
        elemNewPyClassDiv.style.cssText = 'position:releative;height:fit-content;opacity:1;z-index:100;background:#B4B4B4;';
        elemNewPyClassDiv.style.padding = '10px';
        elemNewPyClassDiv.style.wordBreak = 'keep-all;';
        // elemNewPyClassDiv.style.left = '10px';
        elemNewPyClassDiv.style.margin = '10px'
        let make_new_class_element = elemDiv.appendChild(elemNewPyClassDiv);

        make_new_class_element.innerHTML = make_py_class(element_description)
    }

    for (one_case of all_cases) {
        let element, match, parts;
        [element, match, parts] = one_case;

        make_case_element(elemDiv, element[1], element[0], parts);
    }
}

function getScreenBound() {
    var wp_h = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight,
        html.offsetHeight);
    var wp_w = Math.max(document.documentElement["clientWidth"],
        document.body["scrollWidth"], document.documentElement["scrollWidth"],
        document.body["offsetWidth"], document.documentElement["offsetWidth"]);

    return [0, 0, wp_h, wp_w]
}


function setupHintSidePanel(pointer_x, pointer_y, save_place = false) {
    if (save_place)
        return

    var body = document.body, html = document.documentElement;

    var wp_h = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight,
        html.offsetHeight);
    var wp_w = Math.max(document.documentElement["clientWidth"],
        document.body["scrollWidth"], document.documentElement["scrollWidth"],
        document.body["offsetWidth"], document.documentElement["offsetWidth"]);
    var elemDiv = document.getElementById(locator_hint_window_id);
    if (elemDiv) {
        // TODO vertical screens adaptation for mobile screens?

        elemDiv.style.width = '40%'
        elemDiv.style.height = '100%'
        elemDiv.style.top = '0px'

        if (pointer_x < wp_w / 2) {
            elemDiv.style.right = '0px';
            elemDiv.style.left = '';
        } else {
            elemDiv.style.left = '0px';
            elemDiv.style.right = '';
        }
    }
}


function sortBySimilarityV2(element_description, all_cases) {
    // l1.l2.l3.l4.l5.l6.l7 - to find

    // l1.l3.l4.l6.l7  < higher
    // l1.l2.l3.l4.l6  < lower
    // l1.l3.l4.l6.l7.18  < reject
    // weights = 1 2 4 8 16 32 64 128 256 512


    parts = element_description.split('.');
    weights = {}
    let base_w = 1;
    for (let part of parts) {
        weights[part] = base_w;
        base_w *= 2;
    }

    let all = [];
    for (let element of all_cases) {
        // last locator compare
        case_parts = element[1].split('.');
        last_in_entry = parts[parts.length - 1]
        last_in_case = case_parts[case_parts.length - 1]

        // console.log('compare last pair', last_in_entry, last_in_case)
        if (last_in_case !== last_in_entry) {
            // console.log('skip', element);
            continue;
        }

        let weight = 0;
        let similarity = [];
        for (let part of parts) {
            if (element[1].includes(part)) {
                weight += weights[part];
                similarity.push(part)
            }
        }

        if (weight > 0) {
            all.push([element, weight, similarity])
        }
    }

    // Sort the array based on the second element
    all.sort(function (first, second) {
        return second[1] - first[1];
    });
    return all;

    let sorted = all.map(function (tuple) {
        return tuple[0];
    });

    // console.log('sorted:', sorted)
    return sorted
}

function renderHints(element_description, save_place = false) {
    mark_sublocators = false;

    setupHintSidePanel(mouse_x, mouse_y, save_place);

    if (element_description) {
        element_attr = null;
    } else {
        element = document.elementFromPoint(mouse_x, mouse_y);

        element_attr = element.getAttribute('data-n');
        // console.log('element data-n:', element_attr);

        element_description = describe(element);
        // console.log('full element description:', element_description);
    }

    if (element_attr === null) {
        elements = element_description.split('.')
        element_attr = elements[elements.length - 1]
        // console.log('no data-n on element, failing to nearest:', element_attr);
    }

    let all_in_the_world_cases = [];
    for (let locator of Object.entries(map_locators)) {
        all_in_the_world_cases.push(locator);
    }
    all_cases_sorted = sortBySimilarityV2(element_description, all_in_the_world_cases);
    // console.log('new_sorted:', all_cases_sorted)
    printOut(element_description, all_cases_sorted);

}

addEventListener('mousemove', (event) => {
    if (!event.altKey)
        return;

    renderHints();
});
