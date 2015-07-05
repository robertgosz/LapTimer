    
    var Queue = function () {
        
        this.Stack = new Array();

        this.enqueue = function(Item) {
            this.Stack.push(Item);
            return this;
        }

        this.dequeue = function()  {
            return this.Stack.shift();
        }

        this.isEmpty = function(){
            return (this.Stack.length == 0);
        }
            
    }
        
    module.exports = {

        getQueue:  function() {
                return new Queue();
        }

    };
