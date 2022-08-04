/**
 * module multisign provides multisign logics.
 * @module multisign
 * Please refer to multisign_spec.js for example usage.
*/

import { Buffer } from 'buffer';
import * as bn from './utils/bn.js';
import * as bytes from './utils/bytes.js';
import * as hs from './utils/hashes.js';

const BASE_FIELD_Z_P = new bn.BN(2).pow(new bn.BN(255)).sub(new bn.BN(19));

function modpInv(x) {
    return bn.powm(
        x,
        BASE_FIELD_Z_P.sub(new bn.BN(2)),
        BASE_FIELD_Z_P,
    );
}

const CURVE_CONST_D = bn.posMod(
    new bn.BN(-121665).mul(modpInv(new bn.BN(121666))),
    BASE_FIELD_Z_P,
);

const GROUP_ORDER_Q = new bn.BN(2).pow(new bn.BN(252)).add(
    new bn.BN('27742317777372353535851937790883648493')
);

/**
 * sha512Modq hashes the data in sha512, converts the result to BigNumber and modulos GROUP_ORDER_Q.
 * @param {Buffer} s - The data
 * @returns {bn.BN} The result
 */
 function sha512Modq(s) {
    return bn.posMod(
        new bn.BN(hs.sha512Hash(s).reverse()),
        GROUP_ORDER_Q,
    );
}

/** Point is the point in the multisign calculation */
export class Point {
    /**
     * Create a new Point
     * @param {number | bn.BN} X - Coordinate X
     * @param {number | bn.BN} Y - Coordinate Y
     * @param {number | bn.BN} Z - Coordinate Z
     * @param {number | bn.BN} T - Coordinate T
     */
    constructor(X, Y, Z, T) {
        this.X = new bn.BN(X);
        this.Y = new bn.BN(Y);
        this.Z = new bn.BN(Z);
        this.T = new bn.BN(T);
    }

    /**
     * add addes this Point to the given Point.
     * @param {Point} other - The given Point.
     * @returns {Point} The result Point
     */
    add(other) {
        const A = bn.posMod(
            (this.Y.sub(this.X)).mul(other.Y.sub(other.X)),
            BASE_FIELD_Z_P,
        );
        const B = bn.posMod(
            (this.Y.add(this.X)).mul(other.Y.add(other.X)),
            BASE_FIELD_Z_P,
        );
        const C = bn.posMod(
            this.T.mul(new bn.BN(2)).mul(other.T).mul(CURVE_CONST_D),
            BASE_FIELD_Z_P,
        );
        const D = bn.posMod(
            this.Z.mul(new bn.BN(2)).mul(other.Z),
            BASE_FIELD_Z_P,
        );

        const E = B.sub(A);
        const F = D.sub(C);
        const G = D.add(C);
        const H = B.add(A);

        return new Point(E.mul(F), G.mul(H), F.mul(G), E.mul(H));
    }

    /**
     * mul multiplies this Point to the given number.
     * @param {bn.BN} s - The given number.
     * @returns {Point} The result Point.
     */
    mul(s) {
        let P = this;
        let Q = new Point(0, 1, 1, 0);

        const zero = new bn.BN(0);
        const one = new bn.BN(1);

        while (s.gt(zero)) {
            if (s.and(one).gt(zero)) {
                Q = Q.add(P);
            }
            P = P.add(P);
            s = s.shrn(1);
        }
        return Q;
    }

    /**
     * equals returns if the given Point equals to this Point.
     * @param {Point} other - The Point to compare.
     * @returns {boolean} if the given Point equals to this Point.
     */
    equals(other) {
        if (!bn.posMod(this.X.mul(other.Z).sub(other.X.mul(this.Z)), BASE_FIELD_Z_P).isZero()) {
            return false;
        }
        if (!bn.posMod(this.Y.mul(other.Z).sub(other.Y.mul(this.Z)), BASE_FIELD_Z_P).isZero()) {
            return false;
        }
        return true;
    }

    /**
     * compress compresses the Point to bytes
     * @returns {Buffer} - The result bytes
     */
    compress() {
        const zinv = modpInv(this.Z);
        const x = bn.posMod(
            this.X.mul(zinv),
            BASE_FIELD_Z_P,
        );
        const y = bn.posMod(
            this.Y.mul(zinv),
            BASE_FIELD_Z_P,
        );
        const i = y.or(x.and(new bn.BN(1)).shln(255));
        return i.toBuffer('le', 32);
    }

    /**
     * pubKey gets the public key from this point.
     * @returns {Buffer} - The publi key.
     */
    pubKey() {
        const zinv = modpInv(this.Y) ;
        const x = bn.posMod(new bn.BN(0).mul(zinv), BASE_FIELD_Z_P);
        const y = bn.posMod(this.Y.mul(zinv), BASE_FIELD_Z_P);
        return y.or(x.and(new bn.BN(1)).shln(255)).toBuffer('le', 32);
    }

    /**
     * recoverX gets x out of y and sign.
     * @param {bn.BN} y 
     * @param {bn.BN} sign
     * @returns {bn.BN} The result.
     */
    static recoverX(y, sign) {
        if (y.gte(BASE_FIELD_Z_P)) {
            throw new Error('Invalid y');
        }
        const x2 = (y.mul(y).sub(new bn.BN(1))).mul(modpInv(CURVE_CONST_D.mul(y).mul(y).add(new bn.BN(1))));
        if (x2.isZero()) {
            if (!sign.isZero()) {
                throw new Error('Invalid x2 & sign');
            }
            return new bn.BN(0);
        }

        const modpSqrtM1 = bn.powm(
            new bn.BN(2),
            BASE_FIELD_Z_P.sub(new bn.BN(1)).div(new bn.BN(4)),
            BASE_FIELD_Z_P,
        );

        let x = bn.powm(
            x2,
            BASE_FIELD_Z_P.add(new bn.BN(3)).div(new bn.BN(8)),
            BASE_FIELD_Z_P,
        );
        
        if (!bn.posMod(x.mul(x).sub(x2), BASE_FIELD_Z_P).isZero()) {
            x = bn.posMod(
                x.mul(modpSqrtM1),
                BASE_FIELD_Z_P,
            );
        }
        if (!bn.posMod(x.mul(x).sub(x2), BASE_FIELD_Z_P).isZero()) {
            throw new Error('Invalid x');
        }

        if (!x.and(new bn.BN(1)).eq(sign)) {
            x = BASE_FIELD_Z_P.sub(x);
        }
        return x;
    }

    /**
     * decompress decompress the given bytes to a Point.
     * @param {Buffer} b - the bytes to decompress.
     * @returns {Point} The result Point.
     */
    static decompress(b) {
        if (b.length != 32) {
            throw new Error('Invalid input length for decompression');
        }
        let y = new bn.BN(bytes.reverse(b, false));
        const sign = y.shrn(255);
        y = y.and(new bn.BN(1).shln(255).sub(new bn.BN(1)));
        const x = this.recoverX(y, sign);

        return this(
            x, y, new bn.BN(1), bn.posMod(x.mul(y), BASE_FIELD_Z_P)
        );
    }
}

const G = (() => {
    const y = bn.posMod(
        new bn.BN(4).mul(modpInv(new bn.BN(5))),
        BASE_FIELD_Z_P,
    );
    const x = Point.recoverX(y, new bn.BN(0));
    return new Point(
        x, y, new bn.BN(1), bn.posMod(x.mul(y), BASE_FIELD_Z_P),
    );
})();

/** MultiSignPriKey is the private key used by one party participated into the multi-sign procedure. */
export class MultiSignPriKey {
    /**
     * Createa a new MultiSignPriKey from the private key.
     * @param {Buffer} priKey - The private key.
     */
    constructor(priKey) {
        this.priKey = priKey;
        this.a = this.geta();
        this.A = this.getA();
        this.pubKey = this.getPubKey();
    }

    /**
     * geta returns the variable a used in XEdDSA calculation.
     * @returns {bn.BN} The variable a.
     */
    geta() {
        return new bn.BN(bytes.reverse(this.priKey, false))
    }

    /**
     * getA returns the variable A used in XEdDSA calculation.
     * @returns {Buffer} - The variable A.
     */
    getA() {
        return G.mul(this.a).compress();
    }

    /**
     * getPubKey returns the public key of the private key.
     * @returns {Buffer} - The public key.
     */
    getPubKey() {
        if (this.priKey.length != 32) {
            throw new Error('Bad size of private key');
        }

        const h = hs.sha512Hash(this.priKey);
        let a = new bn.BN(h.slice(0, 32).reverse());
        a = a.and(new bn.BN(1).shln(254).sub(new bn.BN(8)));
        a = a.or(new bn.BN(1).shln(254));
        return G.mul(a).compress();
    }

    /**
     * getr returns the variable r used in the XEdDSA calculation.
     * @param {Buffer} msg - The message to sign.
     * @param {Buffer} rand - The 64-byte random bytes.
     * @returns {bn.BN} The variable r.
     */
    getr(msg, rand) {
        let prefix = new bn.BN(0xFE);
        for (let i = 0; i < 31; i++) {
            prefix = prefix.mul(new bn.BN(256));
            prefix = prefix.add(new bn.BN(0xFF));
        }
        prefix = prefix.toBuffer('be', 32);
        
        return sha512Modq(Buffer.concat([
            prefix,
            this.priKey,
            msg,
            rand,
        ]));
    }

    /**
     * getr returns the variable R used in the XEdDSA calculation.
     * @param {Buffer} msg - The message to sign.
     * @param {Buffer} rand - The 64-byte random bytes.
     * @returns {Point} The variable R.
     */
    getR(msg, rand) {
        const r = this.getr(msg, rand);
        return G.mul(r);
    }

    /**
     * getx returns the variable x used in the XEdDSA calculation.
     * @param {Array[Buffer]} allAs - An array of variable A of all MultiSignPriKey participated into the multisign procedure.
     * @returns {bn.BN} The variable x.
     */
    getx(allAs) {
        if (allAs.length == 1) {
            return new bn.BN(1);
        }

        let prefix = new bn.BN(0xFD);
        for (let i = 0; i < 31; i++) {
            prefix = prefix.mul(new bn.BN(256));
            prefix = prefix.add(new bn.BN(0xFF));
        }
        prefix = prefix.toBuffer('be', 32);

        const b = Buffer.concat([
            prefix,
            this.A,
            ...allAs,
        ]);
        return sha512Modq(b);
    }

    /**
     * getbpA returns the variable bpA.
     * @param {Array[Buffer]} allAs - An array of variable A of all MultiSignPriKey participated into the multisign procedure.
     * @returns {Point} The variable bpA.
     */
    getbpA(allAs) {
        const x = this.getx(allAs);
        return G.mul(
            bn.posMod(
                x.mul(this.a),
                GROUP_ORDER_Q,
            )
        );
    }

    /**
     * getxA returns the variable xA.
     * @param {Array[Buffer]} allAs - An array of variable A of all MultiSignPriKey participated into the multisign procedure.
     * @returns {Point} The variable bpA.
     */
    getxA(allAs) {
        const x = this.getx(allAs);
        return G.mul(x.mul(this.a));
    }

    /**
     * sign produces the sub-signature that can be used to compose the multi-signature.
     * @param {Buffer} msg - The message to sign.
     * @param {Buffer} rand - The 64-byte random bytes.
     * @param {Buffer} unionA - The union of a collection of variable xA.
     * @param {Point} unionR - The union of a collection of variable R.
     * @param {Array[Buffer]} allAs - An array of variable A of all MultiSignPriKey participated into the multisign procedure.
     * @returns {bn.BN} - The signature.
     */
    sign(msg, rand, unionA, unionR, allAs) {
        const r = this.getr(msg, rand);
        const x = this.getx(allAs);
        const h = sha512Modq(Buffer.concat([
            unionR.compress(),
            unionA,
            msg,
        ]));
        return bn.posMod(
            bn.posMod(
                r.add(h.mul(x).mul(this.a)),
                GROUP_ORDER_Q,
            ),
            GROUP_ORDER_Q,
        )
    }
}

/** Multisign is the multisign controller */
export class MultiSign {

    /**
     * getUnionA returns the union of a collection of variable xA.
     * @param {Array[Point]} xAs - An array of variable xA of all MultiSignPriKey participated into the multisign procedure.
     * @returns {Buffer} The variable unionA.
     */
    static getUnionA(xAs) {
        let p = xAs[0];

        for (let i = 1; i < xAs.length; i++) {
            p = p.add(xAs[i]);
        }
        return p.compress();
    }

    /**
     * getUnionR returns the union of a collection of variable R.
     * @param {Array[Point]} Rs - An array of variable R of all MultiSignPriKey participated into the multisign procedure.
     * @returns {Point} The variable unionR.
     */
    static getUnionR(Rs) {
        let p = Rs[0];

        for (let i = 1; i < Rs.length; i++) {
            p = p.add(Rs[i]);
        }
        return p;
    }

    /**
     * transferSig transfers the given signature.
     * @param {bn.BN} sig - The signature
     * @param {Buffer} A - The variable A.
     * @returns {Buffer} The transferred signature.
     */
    static transferSig(sig, A) {
        const s = sig.toBuffer('le', 32);
        s[31] = (s[31] & 0x7F) | (A[31] & 0x80);
        return s;
    }

    /**
     * getSig composes the multisign signature from the sub-signatures.
     * @param {Buffer} unionA - The union of a collection of variable xA.
     * @param {Point} unionR - The union of a collection of variable R.
     * @param {Array[bn.BN]} sigs - An array of all sub-signatures.
     * @returns {Buffer} The multisign signature.
     */
    static getSig(unionA, unionR, sigs) {
        let sum = new bn.BN(0);
        for (const sig of sigs) {
            sum = sum.add(sig);
        }
        const s = bn.posMod(sum, GROUP_ORDER_Q);
        return Buffer.concat([
            unionR.compress(),
            this.transferSig(s, unionA),
        ]);
    }

    /**
     * getPub returns the multisign publc key for the multisign signature.
     * @param {Array[Point]} bpAs - An array of variable bpA of all MultiSignPriKey participated into the multisign procedure.
     * @returns {Buffer} The multisign public key.
     */
    static getPub(bpAs) {
        let p = bpAs[0];

        for (let i = 1; i < bpAs.length; i++) {
            p = p.add(bpAs[i]);
        }
        const zinv = modpInv(p.Z);
        const y = bn.posMod(
            p.Y.mul(zinv),
            BASE_FIELD_Z_P,
        );

        const res = bn.posMod(
            y.add(new bn.BN(1)).mul(modpInv(new bn.BN(1).sub(y))), 
            BASE_FIELD_Z_P,
        );
        return res.toBuffer('le', 32);
    }
}
