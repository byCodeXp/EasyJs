// function $(query) {
//     if (!(this instanceof $)) return new $(query);
//     if (query[0] === "#") {
//         this.query = document.querySelector(query);
//     }
//     else
//     {
//         this.query = document.querySelectorAll(query);
//     }
//     this.find = function(pattern) {
//         if (query[0] === "#") {
//             return this.query.querySelector(pattern);
//         }
//         else
//         {
//             return this.query.querySelectorAll(pattern);
//         }
//     }
// }
//
//
// console.log(
//     $('#app')
// )
//
// console.log(
//     $('#app').find('div')
// )