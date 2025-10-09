"use client";

import { useCorporateAccountContext } from '../providers/CorporateAccountProvider';

export const useCorporateAccount = () => {
  return useCorporateAccountContext();
};
