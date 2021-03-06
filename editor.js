(function () {

    "use strict";
    
    /* Trying to push to git direct from Brackets editor for the first time */

    var enterKeyLock = false, toolTipVisible = false, charactersInPara = 0;
    
    /*Register the specified event to a target (element/document/window) and a hadler (callback function) to handle that event*/
    function addEvent(target, event, handler) {
        /* IE8<= doesn't support addEventListener*/
        /*Also target is passed as 'this' to the addEventListener's callback function but this is not true with attachEvent's callback. So pass the target and event explicitly*/
        if (target.addEventListener) {
            target.addEventListener(event, handler, false);
        } else {
            target.attachEvent("on" + event, function (event) {
                return handler.call(event, target);
            });
        }
    }
    
    function removeSubstring(string, substring) {
        string = string.substring(0, string.indexOf(substring)) + string.substring(string.indexOf(substring) + substring.length);
        return string;
    }
    
    function addClass(element, string) {
        if (element.className.trim() !== "") {
            element.className = element.className.trim() + ' ' + string;
        } else {
            element.className += string;
        }
    }
    
    function removeClass(element, string) {
        var className = element.className;
        if (className.indexOf(' ' + string + ' ') >= 0 || className.indexOf(string + ' ') === 0 || className.indexOf(' ' + string) === (className.length - string.length - 1)) {
            element.className = removeSubstring(className, string);
            return true;
        } else {
            return false;
        }
    }
    
    function hideToolTip() {
        var toolTip = document.querySelector('div.tool-tip');
        toolTip.style.display = 'none';
    }
    
    function getCharactersInPara(element) {
        return element.textContent.length;
    }
    
    function removeWhenEmpty(event, target) {
        /* If backspace is pressed and there is no content left in the paragraph then set a global variable true, and if once again a backspace (keycode = 8) is hitted then delete the current para and move focus to the upper para's end
        if the active para is topmost in editor area then don't remove it and keep focus in it*/
        if ((event.keyCode || event.which) === 8) {
            if(charactersInPara == getCharactersInPara(this)) {
                if(this.previousSibling.nodeName.toLowerCase() == "p")
                {
                    this.previousSibling.textContent += this.textContent;
                    this.previousSibling.focus();
                    this.parentNode.removeChild(this);
                }
                return;
            }
            else {
                charactersInPara = getCharactersInPara(this);
            }
        }
        
    }
    

    function makeActivePara(event, target) {
        addClass(this, 'active');
        charactersInPara = getCharactersInPara(this);
    }
    
    function makeInactivePara(event, target) {
        removeClass(this, 'active');
    }
    
    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    
    function createNewPara(referenceNode) {
        
        var newPara = document.createElement("p");
        
        if (referenceNode) {
            /*
            There is already at least one para in editor
            it will happen on ENTER key press
            */
            insertAfter(newPara, referenceNode);
        } else {
            /*
            If there is no para in the editor
            it'll happen when editor loads for the first time
            and there is no para in the biginning
            */
            document.querySelector('div.editor-area').appendChild(newPara);
        }

        addEvent(newPara, 'keydown', monitorSpecialKeys);
        addEvent(newPara, 'keyup', removeWhenEmpty);
        addEvent(newPara, 'focus', makeActivePara);
        addEvent(newPara, 'blur', makeInactivePara);
        addEvent(newPara, 'mouseup', displaySelectedText);
        addEvent(newPara, 'mousedown', hideToolTipOnMouseDown);
        
        newPara.setAttribute('contentEditable', 'true');        
        /*This below line must be here : after attaching 'focus' event to newPara*/
        newPara.focus();
        
    }
    
    function hideToolTipOnMouseDown(event, target) {
        event.stopPropagation();
        
        setTimeout(function () {
            var selectedText = document.all ? document.selection.createRange().text : document.getSelection();

            if(toolTipVisible && selectedText.toString() == "") {
                document.querySelector('div.tool-tip').style.display = 'none';
                toolTipVisible = false;
            }
        }, 50);        
    }
    
    function monitorSpecialKeys(event, target) {
        
        event.stopPropagation();
        
        if(toolTipVisible && !(event.keyCode >=37 && event.keyCode <= 40 )) {
            hideToolTip();
            console.log('monitorSpecialKeys');
            toolTipVisible = false;
        }
        
        /*If enter (keycode = 13) is pressed
        add a new paragraph
        below the current paragraph
        also move focus to the new paragraph
        */
        if(event.shiftKey == true) {
            setTimeout(displaySelectedText, 200);
        }
            
        if ((event.which || event.keyCode) === 13) {
            event.preventDefault();
            createNewPara(this);
            charactersInPara = 0;
            return;
        }
        if((event.which || event.keyCode) != 8) {
            charactersInPara = getCharactersInPara(this);
        }

    }
    
    function focusLastPara(event, target) {
        
         if(toolTipVisible) {
            hideToolTip();
             console.log('focusLastPara');
             toolTipVisible = false;
        }
        
        this.lastElementChild.focus();
    }
    
    function handleSelection(event, target) {
        event.stopPropagation();

         if(toolTipVisible) {
            hideToolTip();
             console.log('focusLastPara');
             toolTipVisible = false;
        }
        
    }

    function displaySelectedText() {
        
        if (toolTipVisible) {
            return;
        }
        var selectedText = document.all ? document.selection.createRange().text : document.getSelection();
        
        if (selectedText.toString() !== "") {
            
            var selectionRectangle, toolTip;
            
            selectionRectangle = selectedText.getRangeAt(0).getBoundingClientRect();
            toolTip = document.querySelector('div.tool-tip');
            
            toolTip.style.top = (selectionRectangle.top - 40) + 'px';            
            toolTip.style.left = (selectionRectangle.left - 5) + 'px';
            
            toolTip.style.display = 'block';
            toolTipVisible = true;
            
            return;
        }
    }
    
    function boldText(event, target) {
        event.preventDefault();
        event.stopPropagation();
        
        document.execCommand("bold", false, null);
    }
    
    function italicText(event, target) {
        event.preventDefault();
        event.stopPropagation();
        
        document.execCommand("italic", false, null);

    }
    
    function underlineText(event, target) {
        event.preventDefault();
        event.stopPropagation();
        document.execCommand("underline", false, null);
    }
    
    window.onload = function () {
        var body, html, editorArea, boldButton, italicButton, underlineButton;
        
        body = document.querySelector('body');
        html = document.querySelector('html');
        editorArea = document.querySelector('div.editor-area');

        editorArea.setAttribute('contentEditable', 'true');

        boldButton = document.querySelector('div.tool-tip a.bold');
        italicButton = document.querySelector('div.tool-tip a.italic');
        underlineButton = document.querySelector('div.tool-tip a.underline');
        
        addEvent(boldButton, 'click', boldText);
        addEvent(italicButton, 'click', italicText);
        addEvent(underlineButton, 'click', underlineText);
        
        addEvent(editorArea, 'mousedown', focusLastPara);
        addEvent(body, 'mousedown', hideToolTipOnMouseDown);
        addEvent(html, 'mousedown', hideToolTipOnMouseDown);
        
        createNewPara();
        
    };
})(window);
