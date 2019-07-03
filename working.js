/*  BUDGET APP! */

//BUDGET CONTROLLER (module that handles our budget data, using IIFE!)
var budgetController = (function() {

    //note that objects are great for storing data, to create a lot of objects, we use function constructors
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    };

    return {
        addItems: function(type, des, val) {
            var newItem, ID;

            //Logic behind creating new ID, need to grab position of last element while adding to it BUT also factoring in that items will be deleted or added.
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9

            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);
            
            //Return the new element
            return newItem;
        },

        //printing our data structure to the console for testing
        testing: function() {
            console.log(data);
        }
    };
})();

//UI CONTROLLER (User inteface module)
var UIController = (function() {
    //creating an object to store all these inputstrings to make code cleaner
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
    };

    return {
        getInput: function() {
            //we want to return these 3 values back so its easier to put them in an object as properties!
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // 1. Create HTML string with placeholder text.

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // 2. Replace the placeholder text with some actual data.
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // 3. Insert the HTML into the DOM.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        //clearing the HTML fields
        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            //Since querySelectorll returns a list(we need an array), we have to use the Array prototype's slice method to convert fields var into an array! We'd normally use slice method but it won't work since fields isn't an array. Instead we'll call the slice method using the call method before passing the fields var in (so it becomes 'this')!
            fieldsArr = Array.prototype.slice.call(fields);
        },
    

        //exposing the DOMstrings to the public so our global app controller has access! (CLOSURES)
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();

//GLOBAL APP CONTROLER [Connect UIcontroller & budgetController (read data from UI and then add that data to budgetcontroller!)]
//will pass in UIcontroller & budgetController modules so this controller can use both data & connect these 2
var controller = (function(budgetCtrl, UICtrl) {

    //so we don't have our event listeners scattered around creating ugly code!
    var setupEventListeners = function() {
        //getting DOMstrings to make code cleaner(not as many strings for DOM elements!)
        var DOM = UICtrl.getDOMstrings();

        // when someone clicks on the button
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // need account for people pressing 'enter/return' instead of clicking
        document.addEventListener('keypress', function(event) {

            // checking to see if keypress matches up with correct keycode for return/enter (13)
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })
    };

    //creating this because of DRY principle!
    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data.
        input = UICtrl.getInput();

        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItems(input.type, input.description, input.value);

        // 3. Add the item to the UI.
        UICtrl.addListItem(newItem, input.type);

        // 4. Calculate the budget.

        // 5. Display the budget on the UI.
    };

    //need our setupEventListeners function above to run but it's private, hence we returned this init function!
    return {
        init: function() {
            console.log('Application has started!');
            setupEventListeners();
        }
    }
})(budgetController, UIController);

controller.init();



































