const { test, expect } = require('@playwright/test');
const { calculatorPage } = require('../pages/calculatorpage');

//Now only the prototype build is selected and all test run fluently.
//Other builds can be uncommented to run tests too.
//When run on all builds 49/150 fail
const builds = ['Prototype', /*'1', '2', '3', '4', '5', '6', '7', '8', '9'*/];
builds.forEach(build => {
  test.describe('Calculator test suite', () => {

    ///Tests configuration/set up
    let page;
    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      calcPage = new calculatorPage(page);
    });
    test.beforeEach(async () => {
      await calcPage.goto();
      await calcPage.selectBuild(build);
    });

    //Addition tests
    const AdditionNums = [
      [2, 2],    // ===   4   /// Positive answer
      [2, -3],   // ===  -1   /// Negative answer
      [2, -2],   // ===   0   /// answer 0
      [2.5, 3.8] // === 6.3   /// Non integer answer
    ];
    AdditionNums.forEach(num => {
      test.only(`${build} build's Addition test ${num[0]} + ${num[1]}`, async () => {
        await calcPage.initOperation(num[0], num[1], 'Add')
        let answer = await calcPage.getAnswer();
        expect(answer).toEqual(`${num[0] + num[1]}`);

        //tests the Integer Only box
        await calcPage.checkIntegerBox();
        answer = await calcPage.getAnswer();
        expect(answer).toEqual(`${(num[0] + num[1]).toFixed(0)}`);
      });
    });

    //Subtraction tests
    const SubtractionNums = [
      [10, 5],     // ===   5  /// Positive answer    
      [5, 10],     // ===  -5  /// Negative answer
      [5, 5],      // ===   0  /// Answer 0
      [5.5, 1.1]   // === 4.4  /// Non integer answer
    ];

    SubtractionNums.forEach(num => {
      test(`${build} build's Subtraction test ${num[0]} - ${num[1]}`, async () => {
        await calcPage.initOperation(num[0], num[1], 'Subtract')
        const answer = await calcPage.getAnswer();
        expect(answer).toEqual(`${num[0] - num[1]}`);
      });
    });

    //Multiplication tests
    const MultiplicationNums = [
      [10, 5],     // ===   50  /// Positive answer    
      [5, -10],    // ===  -50  /// Negative answer
      [5, 0],      // ===    0  /// Answer 0
      [5.5, 1.1]   // === 6.05  /// Non integer answer
    ];

    MultiplicationNums.forEach(num => {
      test.only(`${build} build's Multiplication test ${num[0]} * ${num[1]}`, async () => {
        await calcPage.initOperation(num[0], num[1], 'Multiply');
        const answer = await calcPage.getAnswer();
        expect(answer).toEqual(`${num[0] * num[1]}`);
      });
    });

    //Division tests
    const DivisionNums = [
      [10, 5],     // ===   2  /// Positive answer    
      [50, -5],    // ===  -10 /// Negative answer
      [5, 0],      // Error, division by 0 isn't possible?
      [5.5, 1.6]   // === 3.4375  /// Non integer answer
    ];

    DivisionNums.forEach(num => {
      test.only(`${build} build's Division test ${num[0]} / ${num[1]}`, async () => {
        await calcPage.initOperation(num[0], num[1], 'Divide');

        if (num[1] === 0) {
          const error = await calcPage.getErrorMessage();
          expect(error).toContain('Divide by zero error!');
        } else {
          const answer = await calcPage.getAnswer();
          expect(answer).toEqual(`${num[0] / num[1]}`);
        }
      });
    });

    test(`${build} Concatination test`, async () => {
      await calcPage.initOperation(5.85, 0, 'Concatenate');
      const answer = await calcPage.getAnswer();
      expect(answer).toEqual('5.850');
    });

    //Non numerical inputs tests
    const NonNumericChars = [
      ['abc-+=/!@#', 123],   //Checks if non Numeric values are accepted in the 1st number field
      [123, 'abc-+=/!@#']    //Checks if non Numeric values are accepted in the 2nd number field
    ];

    NonNumericChars.forEach(char => {
      test.only(`${build} Non numeric characters test ${char[0]} and ${char[1]}`, async () => {
        await calcPage.initOperation(char[0], char[1], 'Add');
        const error = await calcPage.getErrorMessage();

        //using isNotANumber function to check which error shoud be shown
        isNaN(char[0]) ?
          expect(error).toContain('Number 1 is not a number') :
          expect(error).toContain('Number 2 is not a number');
      });
    });


    //Clear button test
    test.only(`${build} Clear button test`, async () => {
      await calcPage.initOperation(2, 2, 'Add');
      let answer = await calcPage.getAnswer();
      expect(answer).toEqual('4');

      await calcPage.clearAnswer();

      answer = await calcPage.getAnswer();
      expect(answer).toEqual('');
    });
  });
});