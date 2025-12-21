"use client"

import React, { useState } from 'react'
import {
    AlertCircle,
    AlertTriangle,
    BrainCircuit,
    Check,
    DollarSign,
    Eye,
    FileDigit,
    FileText,
    Info,
    Lock,
    Scan,
} from 'lucide-react'
import { ImageUploader } from './ImageUploader'
import { Button } from './Button'
import type { ExtractedData, ProcessingStatus } from '../lib/extractor/types'

type FieldType = 'currency' | 'year' | 'ssn' | 'ein' | 'text'

const validateField = (value: string | null, type: FieldType): { isValid: boolean; message?: string } => {
    if (!value) return { isValid: false, message: 'Value not found' }

    switch (type) {
        case 'currency':
            return {
                isValid: !isNaN(parseFloat(value)) && isFinite(Number(value)),
                message: 'Invalid number format',
            }
        case 'year':
            return {
                isValid: /^(20)\d{2}$/.test(value),
                message: 'Year must be between 2000-2099',
            }
        case 'ssn':
            return {
                isValid: /^\d{3}-\d{2}-\d{4}$/.test(value),
                message: 'Invalid SSN format (XXX-XX-XXXX)',
            }
        case 'ein':
            return {
                isValid: /^\d{2}-\d{7}$/.test(value),
                message: 'Invalid EIN format (XX-XXXXXXX)',
            }
        case 'text':
            return {
                isValid: value.length > 2,
                message: 'Value appears too short',
            }
        default:
            return { isValid: true }
    }
}

const ValidatedDisplay = ({
    value,
    type,
    className = '',
    prefix = '',
    warnings = [],
}: {
    value: string | null
    type: FieldType
    className?: string
    prefix?: string
    warnings?: any[]
}) => {
    const { isValid, message } = validateField(value, type)
    const hasLogicWarning = warnings && warnings.length > 0
    const logicWarning = hasLogicWarning ? warnings[0] : null

    if (!value) {
        return (
            <div className="flex items-center text-slate-300 text-sm">
                <span>--</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <span
                className={`${className} ${!isValid || hasLogicWarning ? 'text-amber-600 decoration-amber-500/30 decoration-wavy underline underline-offset-2' : ''}`}
            >
                {prefix}
                {value}
            </span>
            {isValid && !hasLogicWarning ? (
                <Check size={14} className="text-green-500/60" />
            ) : (
                <div className="group relative">
                    {hasLogicWarning ? <AlertTriangle size={14} className="text-amber-600 cursor-help" /> : <AlertCircle size={14} className="text-amber-500 cursor-help" />}

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-[11px] rounded-lg shadow-xl w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="font-bold mb-1 border-b border-slate-600 pb-1">{hasLogicWarning ? 'Logic Check Failed' : 'Format Warning'}</div>
                        {logicWarning ? logicWarning.message : message}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                </div>
            )}
        </div>
    )
}

const FafsaQuestion = ({
    questionId,
    questionText,
    value,
    source,
    helperText,
}: {
    questionId: string
    questionText: string
    value: string | null
    source: string
    helperText: string
}) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-4 transition-all hover:border-blue-300 hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">FAFSA Q.{questionId}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide flex items-center">
                        <FileDigit size={10} className="mr-1" />
                        Source: {source}
                    </span>
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1 leading-snug">{questionText}</h3>
                <p className="text-sm text-slate-500">{helperText}</p>
            </div>

            <div className="sm:text-right flex-shrink-0">
                <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 min-w-[140px] flex flex-col items-end justify-center h-full">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Your Value</span>
                    <ValidatedDisplay value={value} type="currency" prefix="$" className="text-xl font-mono font-bold text-blue-700" />
                </div>
            </div>
        </div>
    </div>
)

export default function FinancialAidScanner() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [ocrText, setOcrText] = useState<string>('')
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
    const [status, setStatus] = useState<ProcessingStatus>({ isProcessing: false, progress: 0, message: '' })
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'fafsa' | 'raw'>('fafsa')

    const [language, setLanguage] = useState('eng')
    const [psm, setPsm] = useState('3')

    const handleFileSelected = (file: File) => {
        setOcrText('')
        setExtractedData(null)
        setError(null)
        setSelectedFile(file)
    }

    const handleClear = () => {
        setSelectedFile(null)
        setOcrText('')
        setExtractedData(null)
        setError(null)
    }

    const handleExtractText = async () => {
        if (!selectedFile) return
        setError(null)
        setExtractedData(null)
        setStatus({ isProcessing: true, progress: 0, message: 'Starting document analysis...' })

        try {
            let resultText = ''
            let resultBlocks: any[] = []

            if (selectedFile.type === 'application/pdf') {
                const { processPDF } = await import('../lib/extractor/pdfService')
                setStatus({ isProcessing: true, progress: 10, message: 'Reading PDF structure...' })
                const pdfResult = await processPDF(selectedFile, (msg) => {
                    setStatus((prev) => ({ ...prev, message: msg }))
                })

                if (pdfResult.type === 'text_layer' && pdfResult.data) {
                    resultText = pdfResult.data.text
                    resultBlocks = pdfResult.data.blocks
                    setStatus({ isProcessing: true, progress: 90, message: 'Text layer extracted successfully.' })
                } else if (pdfResult.type === 'image_fallback' && pdfResult.imageBlob) {
                    setStatus({ isProcessing: true, progress: 20, message: 'Scanned PDF detected. Switching to OCR...' })
                    const { performLocalOCR } = await import('../lib/extractor/ocrService')
                    const ocrResult = await performLocalOCR(
                        pdfResult.imageBlob,
                        (progress, message) => {
                            setStatus({ isProcessing: true, progress, message })
                        },
                        { language, psm },
                    )
                    resultText = ocrResult.text
                    resultBlocks = ocrResult.blocks
                }
            } else {
                const { performLocalOCR } = await import('../lib/extractor/ocrService')
                const ocrResult = await performLocalOCR(
                    selectedFile,
                    (progress, message) => {
                        setStatus({ isProcessing: true, progress, message })
                    },
                    { language, psm },
                )
                resultText = ocrResult.text
                resultBlocks = ocrResult.blocks
            }

            setStatus({ isProcessing: true, progress: 95, message: 'Applying tax logic engine...' })

            await new Promise((resolve) => setTimeout(resolve, 100))

            const { extractFinancialData } = await import('../lib/extractor/dataExtraction')
            const data = extractFinancialData(resultText, resultBlocks)

            setExtractedData(data)
            setOcrText(resultText)
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to read document.')
        } finally {
            setStatus({ isProcessing: false, progress: 0, message: '' })
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-brand-600 p-2 rounded-lg">
                            <DollarSign className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">
                            Destination College
                            <span className="block text-xs font-normal text-slate-500">FinAid Doc Scanner</span>
                        </h1>
                    </div>
                    <div className="hidden sm:flex items-center text-sm text-slate-500 space-x-4">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                            <BrainCircuit size={14} className="text-green-600" />
                            <span className="font-medium">On-device analysis</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">1. Upload Financial Document</h2>
                            <ImageUploader onImageSelected={handleFileSelected} selectedImage={selectedFile} onClear={handleClear} />

                            <div className="mt-6">
                                <Button
                                    onClick={handleExtractText}
                                    disabled={!selectedFile || status.isProcessing}
                                    isLoading={status.isProcessing}
                                    className="w-full h-12 text-lg"
                                    icon={<Scan size={20} />}
                                >
                                    {status.isProcessing ? 'Processing...' : 'Auto-Fill FAFSA'}
                                </Button>

                                <div className="flex items-start gap-2 mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-100">
                                    <Lock size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                                    <p>
                                        <strong>Privacy First:</strong> Your documents are scanned entirely in your browser using secure client-side technologies.
                                        No data is sent to Gemini or any cloud server.
                                    </p>
                                </div>
                            </div>

                            {status.isProcessing && (
                                <div className="mt-6 space-y-2">
                                    <div className="flex justify-between text-sm font-medium text-slate-700">
                                        <span>{status.message}</span>
                                        <span>{status.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-brand-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${Math.max(status.progress, 5)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700 text-sm">
                                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                        <div className="border-b border-slate-200 bg-slate-50/50 px-4 pt-3">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center">
                                    <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                    Interpretations
                                </h2>

                                <div className="flex bg-slate-200/50 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('fafsa')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                            viewMode === 'fafsa' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        FAFSA
                                    </button>
                                    <button
                                        onClick={() => setViewMode('raw')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                            viewMode === 'raw' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        Raw Data
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-0 relative bg-slate-50 flex flex-col h-full overflow-hidden">
                            {!ocrText && !status.isProcessing ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                        <FileText size={40} className="opacity-40" />
                                    </div>
                                    <p className="font-semibold text-slate-600 text-lg">Waiting for Document</p>
                                    <p className="text-sm mt-2 max-w-xs leading-relaxed">Upload your W-2 or 1040 tax form to automatically generate FAFSA answers.</p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto">
                                    {viewMode === 'fafsa' && extractedData && (
                                        <div className="p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="mb-6 flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-800">2024-25 FAFSA Worksheet</h3>
                                                    <p className="text-sm text-slate-500 mt-1">Based on {extractedData.formType} ({extractedData.taxYear || 'Year Unknown'})</p>
                                                </div>
                                                <div
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                        extractedData.confidenceScore > 80
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}
                                                >
                                                    {extractedData.confidenceScore}% Confidence
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <FafsaQuestion
                                                    questionId="85 / 36"
                                                    questionText="How much did you earn from working?"
                                                    helperText="This is typically your total wages, salaries, and tips."
                                                    value={extractedData.wages}
                                                    source={extractedData.formType === 'W-2' ? 'W-2 Box 1' : '1040 Line 1z'}
                                                />

                                                <FafsaQuestion
                                                    questionId="80 / 32"
                                                    questionText="What was your Adjusted Gross Income (AGI)?"
                                                    helperText="AGI is only found on the 1040 tax return."
                                                    value={extractedData.agi || (extractedData.formType === 'W-2' ? null : extractedData.wages)}
                                                    source={extractedData.formType === '1040' ? '1040 Line 11' : 'N/A (Need 1040)'}
                                                />

                                                <FafsaQuestion
                                                    questionId="81 / 33"
                                                    questionText="What was your total federal income tax for the year?"
                                                    helperText="This is the amount of tax you were responsible for, not just what was withheld."
                                                    value={extractedData.federalTax}
                                                    source={extractedData.formType === 'W-2' ? 'W-2 Box 2 (Estimate)' : '1040 Line 25'}
                                                />
                                            </div>

                                            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
                                                <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center">
                                                    <Info size={16} className="mr-2" />
                                                    Next Steps
                                                </h4>
                                                <p className="text-xs text-blue-800 leading-relaxed">
                                                    Log in to <strong>studentaid.gov</strong> and transfer these figures to your application. If you are using the IRS Data
                                                    Retrieval Tool (DRT), these numbers will be imported automatically, but this worksheet helps you verify they are correct.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {viewMode === 'raw' && extractedData && (
                                        <div className="p-5 animate-in fade-in duration-300">
                                            <div className="bg-slate-100 p-4 rounded-lg font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-200">
                                                {extractedData.rawText}
                                            </div>

                                            {extractedData.warnings.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Engine Warnings</h4>
                                                    <div className="space-y-2">
                                                        {extractedData.warnings.map((w, i) => (
                                                            <div key={i} className="bg-amber-50 text-amber-800 text-xs p-2 rounded border border-amber-100">
                                                                <span className="font-bold">{w.field}:</span> {w.message}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
