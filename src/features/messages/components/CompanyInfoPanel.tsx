'use client';
import React from "react";

export type CompanyInfo = {
  name: string;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  keywords?: string | null;
  corporate_number?: string | null;
  employee_number?: number | null;
  capital?: string | null;
  business_summary?: string | null;
  // 必要なら追加
};

export default function CompanyInfoPanel({ company }: { company: CompanyInfo }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-2 text-base font-semibold">{company.name}</div>

      <ul className="space-y-1 text-sm">
        {company.location && (
          <li>
            <span className="text-gray-500">所在地：</span>
            <span>{company.location}</span>
          </li>
        )}
        {company.phone && (
          <li>
            <span className="text-gray-500">電話：</span>
            <a className="text-blue-600 hover:underline" href={`tel:${company.phone}`}>
              {company.phone}
            </a>
          </li>
        )}
        {company.email && (
          <li>
            <span className="text-gray-500">メール：</span>
            <a className="text-blue-600 hover:underline" href={`mailto:${company.email}`}>
              {company.email}
            </a>
          </li>
        )}
        {company.website && (
          <li>
            <span className="text-gray-500">Web：</span>
            <a
              className="text-blue-600 hover:underline"
              href={company.website}
              target="_blank"
              rel="noreferrer"
            >
              {company.website}
            </a>
          </li>
        )}
        {company.corporate_number && (
          <li>
            <span className="text-gray-500">法人番号：</span>
            <span>{company.corporate_number}</span>
          </li>
        )}
        {company.employee_number != null && (
          <li>
            <span className="text-gray-500">従業員数：</span>
            <span>{company.employee_number}</span>
          </li>
        )}
        {company.capital && (
          <li>
            <span className="text-gray-500">資本金：</span>
            <span>{company.capital}</span>
          </li>
        )}
      </ul>

      {company.business_summary && (
        <div className="mt-3 text-sm whitespace-pre-wrap">
          <div className="mb-1 font-medium text-gray-600">事業概要</div>
          {company.business_summary}
        </div>
      )}
      {company.keywords && (
        <div className="mt-2 text-xs text-gray-500">
          <span className="mr-1">キーワード:</span>
          {company.keywords}
        </div>
      )}
    </div>
  );
}
