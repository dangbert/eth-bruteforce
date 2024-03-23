import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as ledger from '../ledger.js';

const VALID_SEED =
  'video legal patch flat october doctor hungry junior few finish glow crater aware senior series reopen fragile loan situate depend chaos lake rifle rescue';
const VALID_SEED_ETH_ADDR = '0xc4AB28e5eF5291AD27B8F0FA79ED431EFcd2cDA3';

describe('ledger.js', () => {
  describe('deriveFirstEthAddr()', () => {
    it('derives expected eth address', () => {
      const res = ledger.deriveFirstEthAddr(VALID_SEED);
      expect(res).to.equal(VALID_SEED_ETH_ADDR);
    });
  });
});
