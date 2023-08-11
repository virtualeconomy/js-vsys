/**
 * v escrow contract module provides functionalities for V Escrow contract.
 * @module contract/VEscrowCtrt
 */

'use strict';

import * as ctrt from './ctrt.js';
import * as acnt from '../account.js';
import * as md from '../model.js';
import * as tx from '../tx_req.js';
import * as de from '../data_entry.js';
import * as msacnt from '../multisign_account.js';

/** FuncIdx is the class for function indexes */
export class FuncIdx extends ctrt.FuncIdx {
  static elems = {
    SUPERSEDE: 0,
    CREATE: 1,
    RECIPIENT_DEPOSIT: 2,
    JUDGE_DEPOSIT: 3,
    PAYER_CANCEL: 4,
    RECIPIENT_CANCEL: 5,
    JUDGE_CANCEL: 6,
    SUBMIT_WORK: 7,
    APPROVE_WORK: 8,
    APPLY_TO_JUDGE: 9,
    JUDGE: 10,
    SUBMIT_PENALTY: 11,
    PAYER_REFUND: 12,
    RECIPIENT_REFUND: 13,
    COLLECT: 14,
  };
  static _ = this.createElems();
}

/** StateVar is the class for state variables */
export class StateVar extends ctrt.StateVar {
  static elems = {
    MAKER: 0,
    JUDGE: 1,
    TOKEN_ID: 2,
    DURATION: 3,
    JUDGE_DURATION: 4,
  };
  static _ = this.createElems();
}

/** StateMapIdx is the class for state map index */
export class StateMapIdx extends ctrt.StateMapIdx {
  static elems = {
    CONTRACT_BALANCE: 0,
    ORDER_PAYER: 1,
    ORDER_RECIPIENT: 2,
    ORDER_AMOUNT: 3,
    ORDER_RECIPIENT_DEPOSIT: 4,
    ORDER_JUDGE_DEPOSIT: 5,
    ORDER_FEE: 6,
    ORDER_RECIPIENT_AMOUNT: 7,
    ORDER_REFUND: 8,
    ORDER_RECIPIENT_REFUND: 9,
    ORDER_EXPIRATION_TIME: 10,
    ORDER_STATUS: 11,
    ORDER_RECIPIENT_DEPOSIT_STATUS: 12,
    ORDER_JUDGE_DEPOSIT_STATUS: 13,
    ORDER_SUBMIT_STATUS: 14,
    ORDER_JUDGE_STATUS: 15,
    ORDER_RECIPIENT_LOCKED_AMOUNT: 16,
    ORDER_JUDGE_LOCKED_AMOUNT: 17,
  };
  static _ = this.createElems();
}

/** DBKey is the class for DB key */
export class DBKey extends ctrt.DBKey {
  /**
   * forMaker returns the DBKey object for querying the maker.
   * @returns {DBKey} The DBKey object for querying the maker.
   */
  static forMaker() {
    return new this(StateVar.MAKER.serialize());
  }

  static forJudge() {
    return new this(StateVar.JUDGE.serialize());
  }

  static forTokId() {
    return new this(StateVar.TOKEN_ID.serialize());
  }

  static forDuration() {
    return new this(StateVar.DURATION.serialize());
  }

  static forJudgeDuration() {
    return new this(StateVar.JUDGE_DURATION.serialize());
  }

  /**
   * forContractBalance returns the DBKey object for querying the contract balance.
   * @param {string} addr - The address.
   * @returns {DBKey} The DBKey object for querying the contract balance.
   */
  static forContractBalance(addr) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.CONTRACT_BALANCE,
      de.Addr.fromStr(addr)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderPayer returns the DBKey object for querying the payer of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the payer of the order.
   */
  static forOrderPayer(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_PAYER,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderRcpt returns the DBKey object for querying the recipient of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the recipient of the order.
   */
  static forOrderRcpt(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_RECIPIENT,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderAmount returns the DBKey object for querying the amount of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the amount of the order.
   */
  static forOrderAmount(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_AMOUNT,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderRcptDeposit returns the DBKey object for querying the amount the recipient deposits of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the amount the recipient deposits of the order.
   */
  static forOrderRcptDeposit(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_RECIPIENT_DEPOSIT,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderJudgeDeposit returns the DBKey object for querying the amount the judge deposits in the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the amount the judge deposits in the order.
   */
  static forOrderJudgeDeposit(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_JUDGE_DEPOSIT,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderFee returns the DBKey object for querying the fee of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the fee of the order.
   */
  static forOrderFee(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_FEE,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderRcptAmount returns the DBKey object for querying the recipient amount of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the recipient amount of the order.
   */
  static forOrderRcptAmount(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_RECIPIENT_AMOUNT,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderRefund returns the DBKey object for querying the refund of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the refund of the order.
   */
  static forOrderRefund(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_REFUND,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderRcptRefund returns the DBKey object for querying the recipient refund of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the recipient refund of the order.
   */
  static forOrderRcptRefund(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_RECIPIENT_REFUND,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderExpTime returns the DBKey object for querying the expired time of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the expired time of the order.
   */
  static forOrderExpTime(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_EXPIRATION_TIME,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderStatus returns the DBKey object for querying the status of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the status of the order.
   */
  static forOrderStatus(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_STATUS,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderRcptDepositStatus returns the DBKey object for querying the recipient deposit 
     status of the order.
    * @param {string} orderId - The order id.
    * @returns {DBKey} The DBKey object for querying the recipient deposit status of the order.
    */
  static forOrderRcptDepositStatus(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_RECIPIENT_DEPOSIT_STATUS,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderJudgeDepositStatus returns the DBKey object for querying the judge deposit 
     status of the order.
    * @param {string} orderId - The order id.
    * @returns {DBKey} The DBKey object for querying the judge deposit status of the order.
    */
  static forOrderJudgeDepositStatus(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_JUDGE_DEPOSIT_STATUS,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderSubmitStatus returns the DBKey object for querying the submit status of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the submit status of the order.
   */
  static forOrderSubmitStatus(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_SUBMIT_STATUS,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderJudgeStatus returns the DBKey object for querying the judge status of the order.
   * @param {string} orderId - The order id.
   * @returns {DBKey} The DBKey object for querying the judge status of the order.
   */
  static forOrderJudgeStatus(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_JUDGE_STATUS,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderRcptLockedAmount returns the DBKey object for querying the recipient locked amount 
     of the order.
    * @param {string} orderId - The order id.
    * @returns {DBKey} The DBKey object for querying the recipient locked amount of the order.
    */
  static forOrderRcptLockedAmount(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_RECIPIENT_LOCKED_AMOUNT,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }

  /**
   * forOrderJudgeLockedAmount returns the DBKey object for querying the judge locked amount 
     of the order.
    * @param {string} orderId - The order id.
    * @returns {DBKey} The DBKey object for querying the judge locked amount of the order.
    */
  static forOrderJudgeLockedAmount(orderId) {
    const stmp = new ctrt.StateMap(
      StateMapIdx.ORDER_JUDGE_LOCKED_AMOUNT,
      de.Bytes.fromBase58Str(orderId)
    );
    return new this(stmp.serialize());
  }
}

export class VEscrowCtrt extends ctrt.Ctrt {
  static CTRT_META = md.CtrtMeta.fromB58Str(
    'neYvWKcRQc7czFuzGcHiQrZDaFXXjyX3TeD43tojTqu8vRgdDaF7B5wJupyvKn7RMFQrb5dRMzf87VPa6kSk5v4zWYQAvDqvf34uByuekBA3CHwyBUvFmN2LGUx3ktTGcf5k1zH79jGnY1waSXqsB82348aSpKyzUiKvFko1DFM87FS6SxntjFYVyaZtCqvyd3NMRPZXaZUqLuHHJUNd63zhxMoYA6QokeoDnCM4HWXx3tvz9KYP1L8MpkusEac6yv5FFqhKkzBSwBPkSH73VtGYdFNpeBuTCeracN4WbAWnDrt8jD4cnUYNDQxuPTuczuZ8UApc3wYcM6Vp7LNgtZr5X9WxrarU4N8AsDXMKuwrRDQ3nZprW3BZFARjRhZs9TBqUkazXAbm5k3jfYqEncMPGBbmbr3HdeohsCv8t9uWPT7YBVr27ykaVDHc7NSxxFCHVefqGYQV25AwwGE7ax6MiZCwAibbuZS2hwXXKnTHY89K8jp7hqva9WvMtXtHaDyoXiJdrAaUto63F9bkWrJzVMkdsdqdm4BMF6Kgg7q4H7fwyKNeDxjYeYVT3SYhhntCaKqnNmCpENScHCwCEiJAM9S9ZTHqE3so8kt31rmx92xbD2pQgNHRzSVenDng7DxGJr1sHnzciX6cQRbgaVWycDJiqax79KRxWhPAnYyJQgh1RHHKz8utpocsFgYm8rkiwnzY3biA48EA2FaTqno26N4W58nU14g8xAG4wjGZof9NAMNqc5zBpKTDYov53xLEEJArhbrntyyAYUiWdpqZznzJoaXf6EitKZihRXBuGCgCZ8dpZCwwsfnpEmhNBZEyxGZ3h1P4aG9UVTSu35UNSK6sqvstZtz1bGiYycY4dxdUqQVVzgLAsVMUkaWu7ETKPbw4CJv72oDN48LgBFmLKdtCrkLipVf79CFS6xVUWJ7usK4XxtmnWDjGWvYQNZ62QSWCwTy9SXZDZQMk1qRXYBsfbfpusXGPM4ofT9F7D1GrmEevNZ9pqmkLdgchhm5iwR4hnbsZ7hzJoprLMUG8wtbDKpZeuNYTio4KfRRhAYJmYqNEL15hBfw2yWYDYttUQPe3VYcVE13tWFxuLpjwNgdycHVZxfoLMYoRUMKyCdz2sXuTPQ9EbCF6BEM29ncp2JEiZxJ3unPnwTu3vVUb4ad236qkQ3CfubCAkNLw7huZquMAktPbWEVCPAAp4USXeH84Yt91z3LqtBCx6f6B9UFwrCtNQ1gX8NpmA4sBwJE5iECsc81JKVFVMNhdDZB7wb2HaRyuuiRWhAbQujJGs7dQ8rnaXff9TR4cNK21L36uALBP8iKicb1JRzT8t6idopvSJLphAK3qBQa4Tc3UJpLNsJgMPuGfcvy4pjYH5tL2t59JGibinsmL6fJcYvhXWxSsrZviF5sJxstUvzGmZjxZ3gxcQpGT9CumdE6UJqkrNrUoqt7ZDW4RpPH3fYknrbNsM3gra2R9v2Vc53SQsu1w5SWxTHBqxCAxndBddzM7jhZBvgheJaN3eNh3NdM9WZDZHzWheqYhSDNXQJfMqvNzNq3GBar2Gt8aY1fqZovsFtt16bhfvPXsTixStEnDoiQSy4QgorEryppCckbySpf3pstFtm9i3w5NHCZ4K9eybaWCdN2mKZK2Npv2e3Rj2uchPFWRMWfMyzEcLAPyWjXdF7tPUbrPfp6xK9i3FfpJbKtzaA4VpYx68hWExRe4NiKHteHENTWth8dEqz4GkbJyDaXnJgmRzppw5csdVY8at9rSHqPjq9jXvY7WV1Cfva1rhtrDkFGZ2peoBUGi1U418EVsh5vX8XVHmdf359BU8W3Uk1ChXa8hc67dbz4aMkR6scehz3FxYE3DCUwJ8k9wPxGkrQri4hKUzzoKpCmboeSPYjyiJYrcmSACRifUUEnqVavA38Xe4NSaPxCZeFzwbtEKhLLjdScNosBRZt3kVPPoUWmDVatdzeTtpvTd8KAysju8ruCqD51nU2sUd9yiZbBV3TNRSDsz6BW87nZRewfvPdyx7WQniyyE3Kfww7Q8enAk57KRiSizVaKB3waK68rE76fXzHjCGfkU3UXp9pUsFx41u7BQtpw8VJDWnqzTGyzppntLG4PVh9cQWsGh1dQeapQ5Kx4jFSdGGaePUuXcdfDZ9eXS6SrQEgd9ZKVFdTEAVTeVG2abwcLKoSdF9H8sBtaresTokAUJZfynY5tvnVmCKLaPHT1rBAoAZWennU2XEF6HS2AoHHdCd8JsAfypfpUxTdNGVdQ4JNLNbtPVj6yJw46dYbXjb4HbuKi1bsJjERL3f3HESF5xogqFADA1ApJRsDisSHtqCZhUZXCX8nX7wU9T3hSVp75bnthWZ86TmXPfPkEUnsQryMfGo5sbveJYMP4XUT9TuXphdx34oahDpensuwXvft6BbnfwwSdYjsFdDuRtieUaLad359shRy4KkEyRwPDvVhEc1itqcyWTGzXZs4f7xvJxU3AjzEEjQoBWDYELGhafy2wEoRCSEmMxFPyaumuqyPXiD1usjTXyMsYPRy9pc62c2G5BWB6JEG3z1N82Ps8VH9EcioDrh14EHAuYQ4f82tCqmrx5QWQL8XBiQLofEy8LKDEgKrkYZeFi7nkvnxfezMfVpq7CdGta65opj5C8q43YrN3Gqvu4Bfr97pehzrNxbijLqH31rx1n1aejg5QEiSTT4ajhkbPzZQN6PEbVtHeoaZFw5ZrUdkhV5uage2z3wYKRPTuMmre6dFBevgaH5m9abtTKzM1ZkuTx4nHipV7TnCsRU7ivGgvrfbUcypa8M6FzdjTwvmyjXXnpNivT9waXyxuNMQPgwDt9jFcdP1DkV3utSiE5EGkgUTYgmhDrNwkUpVzFBV5epmee5vqNmbrSfUXvtpv7VWwx9EZq1mK4hxZKTXoMtaAJ7ia87KDKwTcy89gW1iRh1XfA6h9uKdAUz2vhc2xPSxbLEasdWnrZ66GfrQQFfsqzgGb7T7VCzNCMuAFTn9Ziq3qJ9BuBuT8tEnmoFkhitEexeFjaUS9bh53kbnudFK9HzC4KZ8DsLwBUxygnvS7RQjWfSFcv4DJBKVmjN7iBFyCnk6AuY5oXqZSn9JW9yhKyNpBqyxNfDRujNc4jfQku6R8dCZMFcz2EimxQAWV76cFK1HZtRAZcZxoKrLHk9QmgETkXkdcScbQVBkUGa92s5cjUoD5JzEovb612neaZPRK7Z2nCMAeLjUutVqrqrUpY1RprM6DNTvK91hCgGJEiEfeoAnJDrAt474NY6wLp5th4L2J2YA5hBDabjFeWBy8u9ZwxxPyG5vyHKmgLqwkyXeKaCwoEzQjWPFnXmY4eW66bSqXq2Uzgt3v4a1vqmaMNCeUsMsNtG3GhL3tLgtA669E3VcGKk51HLrdE7yu5mPX5NEng9JkydtRBseP3wJyfSFgW9LU5eNo6Dv8W6xt4ZMV8piGPmDvCm9Ue6gQyTTfUwXHjaC3fXPGz7mL1DoxreMqRf8ajqz66iwHibujaW25kR5ENoNvH7tASBQFesXny1oBkwdQkyYFBDE5qJZqt9qd1YFC7g738C7E2HBFfmFvTG8cXUCaeDVdcvzm3eQCVv3b8drauKQeQR3prJDtdt1Diingsg9MhL4TPuEg4T6eu9UeqrVpg7CURNFPhBMEEtdLT4CTjTVzv6oRHw7TqguMKGaSUWyDBrPrbExPq28zCCSdcFwoSm91Az9KDYnYuXdS52ZBMyASifUVoFMqWeEELR2vc4hG1wpvBKT3qHv8gTiCGTtxP6cjkoAJGszM5xbLo62HywyVQu8AKer36QbC1SQkJwGAioHuTjoKKJDMyGrEBtTsTkbH1Btk4pjPBXPMQvjcAQzVPHcRjMWeNVnmmdrx1PP5fU5PKeB8Ww5c75e8dDQrnK6m7Fa4wjaPQMetTgP4ESfGxXgioEbm3mn7e3nwma2rMxW1RqrzyyE8V3ZmHf6qmRQFdpJAvdfWHDwWn5e1t9sn3j292vwmPD27Z2JLQZXUYK7t6LPrjdeqgqf2GRhkYbv8PSM6pKCmGXsXgnabvjhfEH2ep5bD7N92oBWTVxPfBCY983RgcdbFeD3eVaUMXm4xe6jm7jbprEi1ZdjwGJvdLNvrDavHGRnM9ujtmcbiCH3vrkCd348WnGaL6CWjAfwPeEK6PwL3XR3rc1hJ2EPydekHxPtXAUn52WtTf24SqyAuTqBr8AdWdcXDUixd2rnBNDA8DmmDgRCHdqsL5cQdYDiv7RWEtHP6RkXh4A8StsXU6gwJjpK7ESYe1WLHaHiutAwtBEknKecSxywB3ShbQHa3kmY5LXuHwCam8M2P3s3MMeGcKUsadxLqKwRt7JG3Fy9dUuwzaD2gtLkde8VBcqakzcCAgtrsiC5z2Nohtrb1yBNH581TwzTwK3YyyN7Fn1EpHLzzZTWiziAJwwDommXn3VQbW2LgMn2jcuhNtQbnp4mFupHyvMfkfSTUAWLxvWYseacMYPTDK4jfpghukDnGkF589Mfz7sLFcEAsVYLas6kAo3P9DSi7kgthoaKXqtwuiva6YB4CtZYtpcBfvaSYzgvq48nvzMEWKyZCTQEFEe4TRZFyTrEPGygfJVTPCigeQDTbjCXc2DscpDLpfChk9wS5CgYxhyweUJi8T8uqBz5AZkzTj5wPm2Rx1kunfnCJdjXoRYeSpSRKeqh5RQbTHcBgZLKW722pvxEgCyrNKmMLdBjv3d3nmJ3B4Wfjs6Pei8hM2ouMosNnT9Czy9WX2zHpNzYso4JPwhFWDaxMnU1ToWY37dXviptwsLKmmsLujjpwjCp1npRowUJsmuQiVpdqPbPn5ACdBiQEnt4SbeY5933DVP2JpeL2NorUByaMJM4QR6QxSzoKRo1HKHy39wcJdcYFQ3XphebR3c2tHyvjPuzMw9FKkW6jABmBWL9PmRjde7rgFFnThEVKt94n1pKoFjRb1BKcoDqrc4jvKVevu48WVK85AiqBnuhD26zybQtsMFgSTf364B95eoVBk1fSsDkXHkvvquBVZ4yC4tiFd2rXsnBr4R2syTD99wmoh61PpXwN2BAifqMVbhD99WxJtCt2qdthKWhCprqKzJcLPj8KN35MqgboYNPrFCihoS6jyUQRFPzaNBcqkaKrurtMaWTe1LAG1DMvAUiBGjPuHb7rPvuC4jjSNsBJL8TMeC149ni1jn1UriEnZqPrB9tLuHHcP42D7WtztqbyRcwvA3EQRJT9UhbY1zfkg7Wdq9ZwKkb3Wzo4MwFxGu5VUzzDPCSUMAdRny5c5dejFeJrK687kDT6HwidwzYRLgY1CVmSK1VrcUwPxNxQQ58etAQFuw8PiigBTnwQZaiu2z81uyqpUJ9KYhnzHjLC5YwYg14XEmVpQKCs6rW6SxVDD4JqU8GvuAx1Tig73FCwjvR8Miz7K77pUsyVtJ9s9c36qGm8aC2wRTvHP68H1HfQj9z2NVcswfyFd1LoL7wqn16FLqEY1hvaK4kBpWZDV72rmrgZqGDb6ufFQ6rvhk6LfM7W9GVtDciwCWdxTuFHVJQUUHsDWbRq9kxrny42ogTC5R6CXPUo6xLbSEevN6k7N9Zwmc5QY4ZevHcmJYS5ztQ8CDbA3F6b3jZiF1nFPFCCZeAUjhH6ACV9bnvVFX6NYPhEHpw9sznzeTQSiHSUWwqo1VTGsGVuoB42mSXiVhjZ9D4LKMc58AHsxq5EKzwm2hC7zHtPwCcgzYcSBS6mdLXYvPSUYx6jCE6GdRaR989p4own8XRC33YU1kG7m2FVq8gMikVUKH53Xk4u4G5PcZ44rrcRv7qJGmvq3a2e8EhKETdE4stoUs3H8StG834q2R6uLGqHsXMJ4LbB477EKwj62dm5BZsMgLnWv8txz2VUZpSwRosncB5Jp7obwrJ7ihSRWFQjFJirH9LcwwmPwEipSGNAAE18F78pN6kxbUkLpjEqTKh8eu1rvWgqozV35JajWWgodpdFN8nGEFBTx4SJW5R9RZfoo8ScVNAafCG9xDXKxgUGMj82WjsfJYvFyqDTUsYRy49jZomALXyeN4SjrU5yehhqXMvrHEEKdFcmAsYme336yFRdQ2hBQvPSE2b2tnWe3pr9zxHTYQFXjKo7QEF6N62cmMPve9rhvJEWMdcXBDrwDEFySKsJSeMPWzuc9v3rL5qScNpMbp3KGCW6nBBW27E83TSiAUtkY9FKCo3gdbgpTqrS5QSZ531Eqp1KFnaB46C6idScLortbyFquQ6si9FUVJK6GqQWZYFnzh8v8DeYdPE6z9C4Fb2Svuf6Gvh7Lwd853eDChAWUZsQwYjmZka2esqjv5cfprNxm7G7AAVg8DEhiChExkY5eTCm5NVQDiq23jiYcqjMmsFZ3eWEA6tGPi3KVMTkB2ttMVARk72AyRw14Gfb56bDXTbwEnUN2f3zHSNaARfz8mS6SbkRZ7nKtSZsqL5GmjqYL71yrhutwrpgv1rqT4XgqgPJSu6hXpnDo7VXvCjmQkLeMvdjSjBsEgn2BLFKJ3DTTssGbuTWyeS2pDVpv9TCxbeFjYmqndJtVWhKbGoeMCQ1FvijSwjL5kobeoVCBqDvEjEVkHsmTdXiRTysuEvipVQfSzGPXjSx2pKh6M4ejGNjnev18hgvaNYaLMoU84CMpYQ7gzuZXPkhFReNvwMycoMCRoMyyracAzSsp9apni7AVTbs4hBT8L7jBq4Ttce8ewqMtPdzRhrHpip6d1RP5pCQ7DSgYCtAi9kbsiXMCuafHjHmJbSbfdkcgs61svjNTGH9xLjBMxpEpRCPTg28dgTqNMh2UY6vknGNhFzw8hdryGVmkrWtFHhaVMEx25M3egmbLEmm6or6haM4EJvDtUDus5Hgxda5toxz2Mzgi2or7HJAU4Mef3pWWixkpSQcBBDDKwJas6xQkny6Dw52mmyJkiyqVhCWtRwHXw1JSKkdgfEdY68nmTuTYCxMkNcDCXQRyw2SSivfwW3G53dcm4si8rquYAk4Y4Ekq6MaHN8aqv3a6BJ7tNEFVQSyDvJYtnA2Fn9eXtXm1eV97dL7BYgwMyPurvay2YiaTMcUXPHh3xHUePq38M1A4fQXSiBxhi1nb4VDDWbr3FhaTsk2aPJL7ALLrAFcvZWJr1WeCDyH2WNWD3mFcqiykQwauNcUCqrmrsyLVUpFXHicqLh6SMdxLneXcNfAPhi8dKvxrm5UkToSamHbbxZyDQFqm59rzX95VABSurbFe38YfEWgPQAhMFuuCy9yNsAAdp4n9mVjPsxZTfUk6QcAL6qa5SFwj7Xb8frUfiYzLYjWBm6CqUyrbocDFWryiieALKLKuJ4nnHF5Tcd2rWBydd4sRLb6WvNoy36BRdjRkohb5MXLRkccgjVVHFhjqkLiKkF6bNyCRmzbChesKUPPWhD3j2wcbDFfq8UmqxL1dndy5sV1GXN1EPs8QyckywYVKr7u3aBrw8qokLevTGoos1WcvLFiZQEkqrfsjKVzJdq52Tu5x7SdTMHFUUw16TKagZNtLYFNP2ZbqqLbDuBJjM5A8qkaYRQ93iqGJ8T4MkCJPRBqCxbzEG9NjQsfKdwgsVLryXA1MV4PeMANjk94fBKyJuCm9CMUtSoaDGNDs2XcUhQRdeAqhjrpc5FN15AHHGz7t2vySQXu2aYfZ4TwL5X9ZFQfrZgQjGwwqKJC3BTiSD3RdzEbTXYVTQhtKUAaZdbzzXbpipP7qpAetZhuRZbyLchdcvqGPXyHVAhn5YTbVmYqChzsUaK6jhrcnCHV37HyBR2HAQG8BMkwJffcm8uD259JSYMmrKbgvQggXcXdCfh2bu3qHgZvbwsgF9vkjAwWhsJz2BGdRDSRGhtqDc8hjcYRSBMizzFEpQytET4KRUJqHPNhVgfeuDiPPRivH1s1D'
  );

  constructor(ctrtId, chain) {
    super(ctrtId, chain);
    this._tokId = undefined;
    this._unit = 0;
  }
  /**
   * getMaker queries & returns the maker of the contract.
   * @returns {md.Addr} The address of the maker of the contract.
   */
  async getMaker() {
    const rawVal = await this.queryDbKey(DBKey.forMaker());
    return new md.Addr(rawVal);
  }

  /**
   * getJudge queries & returns the judge of the contract.
   * @returns {md.Addr} The address of the judge of the contract.
   */
  async getJudge() {
    const rawVal = await this.queryDbKey(DBKey.forJudge());
    return new md.Addr(rawVal);
  }

  /**
   * getTokId queries & returns the token id of the contract.
   * @returns {md.Token} The address of the maker of the contract.
   */
  async getTokId() {
    if (!this._tokId) {
      const rawVal = await this.queryDbKey(DBKey.forTokId());
      this._tokId = new md.TokenID(rawVal);
      return this._tokId;
    }
    return this._tokId;
  }

  /**
   * getDuration queries & returns the duration of the contract.
   * @returns {md.VSYSTimestamp} The duration.
   */
  async getDuration() {
    const rawVal = await this.queryDbKey(DBKey.forDuration());
    return md.VSYSTimestamp.fromUnixTs(rawVal);
  }

  /**
   * getUnit returns the unit of the token of this contract.
   * @returns {number} The unit of the token.
   */
  async getUnit() {
    if (this._unit <= 0) {
      const tokId = await this.getTokId();
      const tokInfo = await this.chain.api.ctrt.getTokInfo(tokId.data);
      this._unit = tokInfo.unity;
      return this._unit;
    }
    return this._unit;
  }

  /**
   * getJudgeDuration queries & returns the judge duration of the contract.
   * @returns {md.VSYSTimestamp} The duration.
   */
  async getJudgeDuration() {
    const rawVal = await this.queryDbKey(DBKey.forJudgeDuration());
    return md.VSYSTimestamp.fromUnixTs(rawVal);
  }

  /**
   * getCtrtBal gets the token balance within this contract belonging to the user address.
   * @param {string} addr - The account address.
   * @returns {md.Token} The token balance.
   */
  async getCtrtBal(addr) {
    const rawVal = await this.queryDbKey(DBKey.forContractBalance(addr));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOrderPayer gets the payer of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Addr} The payer address.
   */
  async getOrderPayer(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderPayer(orderId));
    return new md.Addr(rawVal);
  }

  /**
   * getOrderRcpt gets the recipient of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Addr} The recipient address.
   */
  async getOrderRcpt(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderRcpt(orderId));
    return new md.Addr(rawVal);
  }

  /**
   * getOrderAmount gets the amount of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Token} The amount of the order.
   */
  async getOrderAmount(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderAmount(orderId));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOrderRcptDeposit gets the amount of the recipient deposit of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Token} The amount of the recipient deposit of the order.
   */
  async getOrderRcptDeposit(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderRcptDeposit(orderId));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOrderJudgeDeposit gets the amount of the judge deposit of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Token} The amount of the judge deposit of the order.
   */
  async getOrderJudgeDeposit(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderJudgeDeposit(orderId));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOrderFee gets the fee of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Token} The order fee.
   */
  async getOrderFee(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderFee(orderId));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOrderRcptAmount gets the recipient amount of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Token} The recipient amount of the order.
   */
  async getOrderRcptAmount(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderRcptAmount(orderId));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOrderRefund gets the refund of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Token} The refund of the order.
   */
  async getOrderRefund(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderRefund(orderId));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOrderRcptRefund gets the recipient refund of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Addr} The recipient refund of the order.
   */
  async getOrderRcptRefund(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderRcptRefund(orderId));
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOrderExpTime gets the expire time of the order.
   * @param {string} orderId - The order id.
   * @returns {md.VSYSTimestamp} The expire time of the order.
   */
  async getOrderExpTime(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderExpTime(orderId));
    return md.VSYSTimestamp.fromUnixTs(rawVal);
  }

  /**
   * getOrderStatus gets the status of the order.
   * @param {string} orderId - The order id.
   * @returns {boolean} The status of the order.
   */
  async getOrderStatus(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderStatus(orderId));
    return rawVal === 'true';
  }

  /**
   * getOrderRcptDepositStatus gets the recipient deposit status of the order.
   * @param {string} orderId - The order id.
   * @returns {boolean} The recipient deposit status of the order.
   */
  async getOrderRcptDepositStatus(orderId) {
    const rawVal = await this.queryDbKey(
      DBKey.forOrderRcptDepositStatus(orderId)
    );
    return rawVal === 'true';
  }

  /**
   * getOrderJudgeDepositStatus gets the judge deposit status of the order.
   * @param {string} orderId - The order id.
   * @returns {boolean} The judge deposit status of the order.
   */
  async getOrderJudgeDepositStatus(orderId) {
    const rawVal = await this.queryDbKey(
      DBKey.forOrderJudgeDepositStatus(orderId)
    );
    return rawVal === 'true';
  }

  /**
   * getOrderSubmitStatus gets the submit status of the order.
   * @param {string} orderId - The order id.
   * @returns {boolean} The submit status of the order.
   */
  async getOrderSubmitStatus(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderSubmitStatus(orderId));
    return rawVal === 'true';
  }

  /**
   * getOrderJudgeStatus gets the submit status of the order.
   * @param {string} orderId - The order id.
   * @returns {boolean} The submit status of the order.
   */
  async getOrderJudgeStatus(orderId) {
    const rawVal = await this.queryDbKey(DBKey.forOrderJudgeStatus(orderId));
    return rawVal === 'true';
  }

  /**
   * getOrderRcptLockedAmount gets the recipient locked amount of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Token} The recipient locked amount of the order.
   */
  async getOrderRcptLockedAmount(orderId) {
    const rawVal = await this.queryDbKey(
      DBKey.forOrderRcptLockedAmount(orderId)
    );
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * getOrderJudgeLockedAmount gets the judge locked amount of the order.
   * @param {string} orderId - The order id.
   * @returns {md.Addr} The judge locked amount of the order.
   */
  async getOrderJudgeLockedAmount(orderId) {
    const rawVal = await this.queryDbKey(
      DBKey.forOrderJudgeLockedAmount(orderId)
    );
    const unit = await this.getUnit();
    return md.Token.fromNumber(rawVal, unit);
  }

  /**
   * register registers a V Escrow Contract.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action maker.
   * @param {string} tokId - The ID of the token deposited into the contract.
   * @param {number} duration - The duration where the recipient can take actions.
   * @param {number} judgeDuration - The duration where the judge can take actions.
   * @param {string} ctrtDescription - The description of the contract. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.RegCtrtFee.DEFAULT.
   * @returns {VEscrowCtrt} The VEscrowCtrt object of the registered V Escrow Contract.
   */
  static async register(
    by,
    tokId,
    duration,
    judgeDuration,
    ctrtDescription,
    fee = md.RegCtrtFee.DEFAULT
  ) {
    const data = await by.registerContractImpl(
      new tx.RegCtrtTxReq(
        new de.DataStack(
          de.TokenID.fromStr(tokId),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(duration)),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(judgeDuration))
        ),
        this.CTRT_META,
        md.VSYSTimestamp.now(),
        new md.Str(ctrtDescription),
        md.RegCtrtFee.fromNumber(fee)
      )
    );
    return new this(data.contractId, by.chain);
  }

  /**
   * supersede transfers the judge right of the contract to another account.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} newJudge - The new judge of the contract.
   * @param {string} attachment - The attachment of the action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async supersede(by, newJudge, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const judgeMd = md.Addr(newJudge);
    judgeMd.mustOn(by.chain);

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SUPERSEDE,
        new de.DataStack(new de.Addr(judgeMd)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
  * create creates an escrow order.
    NOTE that the transaction id of this action is the order ID.
  * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
  * @param {string} recipient - The recipient account.
  * @param {number} amount - The amount of tokens.
  * @param {number} rcptDepositAmount - The amount that the recipient needs to deposit.
  * @param {number} judgeDepositAmount - The amount that the judge needs to deposit.
  * @param {number} orderFee - The fee for this order.
  * @param {number} refundAmount - The amount to refund.
  * @param {number} expireTime - The expiration time of the order.
  * @param {string} attachment - The attachment of this action. Defaults to ''.
  * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
  * @returns {object} The response returned by the Node API.
  */
  async create(
    by,
    recipient,
    amount,
    rcptDepositAmount,
    judgeDepositAmount,
    orderFee,
    refundAmount,
    expireTime,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const rcptMd = new md.Addr(recipient);
    rcptMd.mustOn(by.chain);

    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.CREATE,
        new de.DataStack(
          new de.Addr(rcptMd),
          de.Amount.forTokAmount(amount, unit),
          de.Amount.forTokAmount(rcptDepositAmount, unit),
          de.Amount.forTokAmount(judgeDepositAmount, unit),
          de.Amount.forTokAmount(orderFee, unit),
          de.Amount.forTokAmount(refundAmount, unit),
          new de.Timestamp(md.VSYSTimestamp.fromUnixTs(expireTime))
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * recipientDeposit deposits tokens the recipient deposited into the contract into the order.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {string} attachment - The attachment of this action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async recipientDeposit(
    by,
    orderId,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.RECIPIENT_DEPOSIT,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * judgeDeposit deposits tokens the judge deposited into the contract into the order.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {string} attachment - The attachment of this action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async judgeDeposit(
    by,
    orderId,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.JUDGE_DEPOSIT,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * payerCancel cancels the order by the payer.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {string} attachment - The attachment of this action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async payerCancel(
    by,
    orderId,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.PAYER_CANCEL,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * recipientCancel cancels the order by the recipient.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {string} attachment - The attachment of this action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async recipientCancel(
    by,
    orderId,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.RECIPIENT_CANCEL,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * judgeCancel cancels the order by the judge.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {string} attachment - The attachment of this action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async judgeCancel(
    by,
    orderId,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.JUDGE_CANCEL,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * submitWork submits the work by the recipient.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {string} attachment - The attachment of this action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async submitWork(by, orderId, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SUBMIT_WORK,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * approveWork approves the work and agrees the amounts are paid by the payer.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {string} attachment - The attachment of this action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async approveWork(
    by,
    orderId,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.APPROVE_WORK,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
   * applyToJudge applies for the help from judge by the payer.
   * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
   * @param {string} orderId - The order id.
   * @param {string} attachment - The attachment of this action. Defaults to ''.
   * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
   * @returns {object} The response returned by the Node API.
   */
  async applyToJudge(
    by,
    orderId,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.APPLY_TO_JUDGE,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
  * doJudge judges the work and decides on how much the payer & recipient
    will receive.
  * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
  * @param {string} orderId - The order id.
  * @param {number} payerAmount - The amount the payer will get.
  * @param {number} rcptAmount - The amount the recipient will get.
  * @param {string} attachment - The attachment of this action. Defaults to ''.
  * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
  * @returns {object} The response returned by the Node API.
  */
  async doJudge(
    by,
    orderId,
    payerAmount,
    rcptAmount,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const unit = await this.getUnit();

    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.JUDGE,
        new de.DataStack(
          de.Bytes.fromBase58Str(orderId),
          de.Amount.forTokAmount(payerAmount, unit),
          de.Amount.forTokAmount(rcptAmount, unit)
        ),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
  * submitPenalty submits penalty by the payer for the case where the recipient does not submit
    work before the expiration time. The payer will obtain the recipient deposit amount and the payer amount(fee deducted).
    The judge will still get the fee.
  * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
  * @param {string} orderId - The order id.
  * @param {string} attachment - The attachment of this action. Defaults to ''.
  * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
  * @returns {object} The response returned by the Node API.
  */
  async submitPenalty(
    by,
    orderId,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.SUBMIT_PENALTY,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
  * payerRefund makes the refund action by the payer when the judge does not judge the work in time
    after the apply_to_judge function is invoked.
    The judge loses his deposit amount and the payer receives the refund amount.
    The recipient receives the rest.
  * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
  * @param {string} orderId - The order id.
  * @param {string} attachment - The attachment of this action. Defaults to ''.
  * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
  * @returns {object} The response returned by the Node API.
  */
  async payerRefund(
    by,
    orderId,
    attachment = '',
    fee = md.ExecCtrtFee.DEFAULT
  ) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.PAYER_REFUND,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
 * rcptRefund makes the refund action by the recipient when the judge does not judge the work in time
   after the apply_to_judge function is invoked.
    The judge loses his deposit amount and the payer receives the refund amount.
    The recipient receives the rest.
  * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
  * @param {string} orderId - The order id.
  * @param {string} attachment - The attachment of this action. Defaults to ''.
  * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
  * @returns {object} The response returned by the Node API.
  */
  async rcptRefund(by, orderId, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.RECIPIENT_REFUND,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }

  /**
  * collect collects the order amount & recipient deposited amount by the recipient when the work is submitted
    while the payer doesn't either approve or apply to judge in his action duration.
    The judge will get judge deposited amount & fee.
  * @param {acnt.Account | msacnt.MultiSignAccount} by - The action taker.
  * @param {string} orderId - The order id.
  * @param {string} attachment - The attachment of this action. Defaults to ''.
  * @param {number} fee - The fee to pay for this action. Defaults to md.ExecCtrtFee.DEFAULT.
  * @returns {object} The response returned by the Node API.
  */
  async collect(by, orderId, attachment = '', fee = md.ExecCtrtFee.DEFAULT) {
    const data = await by.executeContractImpl(
      new tx.ExecCtrtFuncTxReq(
        this.ctrtId,
        FuncIdx.COLLECT,
        new de.DataStack(de.Bytes.fromBase58Str(orderId)),
        md.VSYSTimestamp.now(),
        new md.Str(attachment),
        md.ExecCtrtFee.fromNumber(fee)
      )
    );
    return data;
  }
}
