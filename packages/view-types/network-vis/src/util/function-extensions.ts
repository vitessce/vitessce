Function.prototype.bindArgs = function (...boundArgs: any) {
   // eslint-disable-next-line @typescript-eslint/no-this-alias
   const targetFunction = this;
   return  (...args: any) => {
      return targetFunction.call(this, ...boundArgs, ...args);
   };
};

Function.prototype.rebind = function (thisArg: any) {
   // eslint-disable-next-line @typescript-eslint/no-this-alias
   const targetFunction = this;
   return  (...args: any) => {
      return targetFunction.call(thisArg, this, ...args);
   };
};
