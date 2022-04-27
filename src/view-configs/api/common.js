/**
 * Class representing a horizontal concatenation of views.
 */
export class VitessceConfigViewHConcat {
  constructor(views) {
    this.views = views;
  }
}

/**
 * Class representing a vertical concatenation of views.
 */
export class VitessceConfigViewVConcat {
  constructor(views) {
    this.views = views;
  }
}

/**
 * A helper function to create a horizontal concatenation of views.
 * @param  {...(VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat)} views A
 * variable number of views or view concatenations.
 * @returns {VitessceConfigViewHConcat} A new horizontal view concatenation instance.
 */
export function hconcat(...views) {
  const vcvhc = new VitessceConfigViewHConcat(views);
  return vcvhc;
}

/**
 * A helper function to create a vertical concatenation of views.
 * @param  {...(VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat)} views A
 * variable number of views or view concatenations.
 * @returns {VitessceConfigViewVConcat} A new vertical view concatenation instance.
 */
export function vconcat(...views) {
  const vcvvc = new VitessceConfigViewVConcat(views);
  return vcvvc;
}
