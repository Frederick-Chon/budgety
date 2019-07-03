/*  BUDGET APP! */

//BUDGET CONTROLLER (module that handles our budget data, using IIFE!)
var budgetController = (function() {

    //note that objects are great for storing data, to create a lot of objects, we use function constructors
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
            //console.log('Cur is: ' + cur);
        });
        data.totals[type] = sum;
        /* breakdown of how we used .forEach above 
        sum = 0
        [200, 400, 100]
        1st iteration: sum = 0 + 200;
        2nd: 200 + 400;
        3rd: 600 + 100;
        */
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
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

        deleteItem: function(type, id) {
            var ids, index;
            //imagine we had id = 3
            //data.allItems[type][id] wouldn't work because our ID's aren't in order!
            //example from our addItems method!
            // ids = [1 2 4 6 8], if we deleted ID = 3, we'd be deleting the 3rd element which is ID = 6, not 3!
            // if we wanted to delete ID = 6,
            // index = 3 (3rd element is the one where ID = 6!)

            ids = data.allItems[type].map(function(current) {
                return current.id;
            }); 

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            //1. Calculate total income & expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //2. Calcuate the budget; income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. Calculate the percentage of income that we spent
            // Using if statement because percentage will be infinity if theres no income!
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
           
        },
 
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            })
            return allPerc;
        },

        //Using a method to return budget,totalInc,totalExp,percentage properties so we can use in our global app controller. 
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        //printing our data structure to the console for testing!
        //this is extremely useful for testing a live app, its nice to be able to go in the console and if our changes are working and to find out bugs!
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
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /* RULES
        1. + or - if income or expense
        2. Exactly decimal point for all nums
        3. Comma separator if num in thousands
        2310.4567 --> + 2,310.46
        2000 -> + 2,000.00
        */
        num = Math.abs(num); //Math.abs takes the absolute of a number, ignores - or +!
        num = num.toFixed(2); // .toFixed(2) --> always exactly 2 decimal numbers

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510 --> 23,510
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            //we want to return these 3 values back so its easier to put them in an object as properties!
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // 1. Create HTML string with placeholder text.

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // 2. Replace the placeholder text with some actual data.
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
 
            // 3. Insert the HTML into the DOM.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);            
        },

        //clearing the HTML fields
        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            //Since querySelectorll returns a list(we need an array), we have to use the Array prototype's slice method to convert fields var into an array! We'd normally use slice method but it won't work since fields isn't an array. Instead we'll call the slice method using the call method before passing the fields var in (so it becomes 'this')!
            fieldsArr = Array.prototype.slice.call(fields);

            //using forEach method to loop through the array and clear the values so the input fields are cleared after it's been added!
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            //Focus's on the first element of the array(inputDescription) so it's easier to add more stuff to our app!
            fieldsArr[0].focus();
        },
    
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, year, month, months;
            
            //var christmas = new Date(2016, 11, 25);
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
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
        });

        //Adding event listener for delete an item from income/expense list using event delegation. Going through HTML file shows that the container element is the parent element for the income/expense delete buttons. EVENT DELEGATION!
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        //change event for red/blue highlighting on elements
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    //Update budget function! We will move (4. Calculate the budget) & (5. Display the budget on the UI) in here BECAUSE these 2 will be always be done together AND we will need to do these 2 again when we delete an item as well. By creating a separate function where we can do combine these will be better for the DRY principle. If we don't do this then we'll just have a bunch of repeating code which is not good. (ALWAYS THINK OF DOING IT THIS WAY, CLEANER CODE MAKES IT EASIER TO UNDERSTAND!)

    //NOTE That we'll be using different methods for calculating the budget & returning the budget. GET USED TO THE PHILOSOPHY OF EACH FUNCTION PERFORMING A SPECIFIC TASK!
    var updateBudget = function() {

        // 1. Calculate the budget.
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI.
        UICtrl.displayBudget(budget)
        //console.log(budget); //to see if budget is properly working

    };

    var updatePercentages = function() {
        // 1. Calculate the percentages.
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller.
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages.
        UICtrl.displayPercentages(percentages);
        //console.log(percentages); //Used console.log for testing purposes!
    };

    //creating this because of DRY principle!
    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data.
        input = UICtrl.getInput();

        //One issue we had in our app so far is the app allowing entries get added to the income/expenses list with no description or no numbers(NaN). The issue arises because we aren't checking for it! Hence this if statement which will check the following
        //1. Is the description blank?
        //2. Is the input value a number? (isNaN() is a method to check if it is a number, use !(NOT OPERATOR) to do opposite!)
        //3. Check if input.value is greater than 0 since 0 will technically work 

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItems(input.type, input.description, input.value);

            // 3. Add the item to the UI.
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget!
            updateBudget();

            // 6. Calculate and update percentages.
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        //traversing the DOM using parentNode. Used it 4 times to move all the way up to the element with income/expense ID! Can test it out by console.log(event.target.parentNode) and clicking while adding another parentNode.
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //format we have so far is inc-1 or exp-1
            //we can test split in the console.
            // var s = 'inc-1'
            // s.split('-') --> ['inc', '1']
            //var c = 'inc-1-type-3'
            // c.split('-') --> ['inc', '1', 'type', '3']
 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); //used parseInt here because we need a number, not a string!

            // 1. Delete the item from the data structure.
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI.
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget.
            updateBudget();

            // 4. Calculate and update percentages.
            updatePercentages();
        };

    };

    //need our setupEventListeners function above to run but it's private, hence we returned this init function!
    return {
        init: function() {
            console.log('Application has started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
})(budgetController, UIController);

controller.init();



































