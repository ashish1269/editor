(function () {

    "use strict";
    
    var enterKeyLock = false;
    
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
    
        
    function removeWhenEmpty(event, target) {
        /* If backspace is pressed and there is no content left in the paragraph then set a global variable true, and if once again a backspace (keycode = 8) is hitted then delete the current para and move focus to the upper para's end
        if the active para is topmost in editor area then don't remove it and keep focus in it*/
        if ((event.keyCode || event.which) === 8) {
            if (this.className.indexOf('blank') >= 0) {
                this.previousSibling.focus();                
                this.parentNode.removeChild(this);
                
            } else if (this.textContent === "") {
                addClass(this, 'blank');
            }
        }
        
    }
    

    function makeActivePara(event, target) {
        addClass(this, 'active');
    }
    
    function makeInactivePara(event, target) {
        removeClass(this, 'active');
    }
    
    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    
    
    function createNewPara(referenceNode) {
        
        var newPara = document.createElement("p");
        insertAfter(newPara, referenceNode);
        
        newPara.setAttribute('contentEditable', 'true');
        addClass(newPara, 'blank'); /*New para will be blank*/
        
        newPara.focus();

        addEvent(newPara, 'keydown', monitorSpecialKeys);
        addEvent(newPara, 'keyup', removeWhenEmpty);
        addEvent(newPara, 'focus', makeActivePara);
        addEvent(newPara, 'blur', makeInactivePara);
    }
    
    function monitorSpecialKeys(event, target) {
        
        /*If enter (keycode = 13) is pressed
        add a new paragraph
        below the current paragraph
        also move focus to the new paragraph
        */
        
        if ((event.which || event.keyCode) === 13) {            
            event.preventDefault();
            createNewPara(this);
            return;
        }

        if (this.textContent !== "") {
            removeClass(this, 'blank');
        }
        
    }

    window.onload = function () {
        var i, firstPara = null, anyPara;
        
        firstPara = document.createElement("p");
        
        document.querySelector('div.editor-area').appendChild(firstPara);
        
        addEvent(firstPara, 'keydown', monitorSpecialKeys);
        addEvent(firstPara, 'focus', makeActivePara);
        addEvent(firstPara, 'blur', makeInactivePara);
        firstPara.setAttribute('contentEditable', 'true');
        firstPara.className += 'blank';
        firstPara.focus();

    };
})(window);