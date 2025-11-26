/**
 * Extended Warranty Transaction Types
 * Database table: EWSADM.EXTND_WRNTY_TXN
 */

export interface ExtndWrntyTxnRow {
  extnd_wrnty_txn_typ_cd: string;
  extnd_wrnty_txn_stat_cd: string;
  extnd_wrnty_txn_err_cd: string | null;
  extnd_wrnty_txn_err_txt: string | null;
}
