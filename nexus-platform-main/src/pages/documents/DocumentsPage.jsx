import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  Shield,
  AlertCircle,
  PenTool,
  Filter,
  Search,
  ArrowUpRight,
  Lock,
  Eye,
  X,
  CheckCircle,
  FileUp,
  Signature,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";

const mockDeals = [
  {
    id: "d1",
    name: "Seed Investment Agreement.pdf",
    type: "Legal",
    size: "1.4 MB",
    lastModified: "2024-03-28",
    status: "In Review",
    owner: "Nexus Legal",
    priority: "High",
  },
  {
    id: "d2",
    name: "Intellectual Property Transfer.pdf",
    type: "Legal",
    size: "850 KB",
    lastModified: "2024-03-25",
    status: "Signed",
    owner: "Nexus Legal",
    priority: "Medium",
  },
  {
    id: "d3",
    name: "Draft Term Sheet - Series A.pdf",
    type: "Draft",
    size: "2.1 MB",
    lastModified: "2024-04-01",
    status: "Draft",
    owner: "You",
    priority: "Critical",
  },
];

const DocumentsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signedDoc, setSignedDoc] = useState("");
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map((file) => ({
      id: `f${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type.includes("pdf") ? "PDF" : "Document",
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      lastModified: new Date().toISOString().split("T")[0],
      status: "Draft",
      owner: "You",
      priority: "Medium",
      file,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const allDocuments = [...mockDeals, ...uploadedFiles];

  const updateDocumentStatus = (docId, newStatus) => {
    setUploadedFiles((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status: newStatus } : doc))
    );
  };

  const openSignModal = (doc) => {
    setSelectedFile(doc);
    setIsSigning(true);
    setSignedDoc("");
  };

  const handleSignDocument = () => {
    if (selectedFile) {
      updateDocumentStatus(selectedFile.id, "Signed");
      setIsSigning(false);
      setSelectedFile(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Signed":
        return <Badge variant="success">Signed</Badge>;
      case "In Review":
        return <Badge variant="secondary">In Review</Badge>;
      case "Draft":
        return <Badge variant="gray">Draft</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesTab = activeTab === "all" || activeTab === "chamber" ? true : true;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Document Hub</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage, secure and sign your startup assets.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          <Button
            variant="outline"
            leftIcon={<Lock size={18} />}
            className="border-gray-200"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Document
          </Button>
          <Button leftIcon={<Upload size={18} />} className="bg-primary-600 text-white" onClick={() => fileInputRef.current?.click()}>
            Upload New
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-1 bg-gray-100/80 p-1 rounded-2xl w-fit backdrop-blur-md border border-gray-200/50 shadow-inner">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
            activeTab === "all" ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          General Assets
        </button>
        <button
          onClick={() => setActiveTab("chamber")}
          className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${
            activeTab === "chamber" ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Shield size={16} className={activeTab === "chamber" ? "text-primary-500" : ""} />
          Deal Chamber
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-2xl bg-gradient-to-br from-gray-900 to-slate-800 text-white overflow-hidden">
            <CardBody className="p-8">
              <div className="bg-primary-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-primary-500/30">
                <Lock className="text-primary-400" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3 tracking-tight">Vault Status</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Your Deal Chamber is encrypted. You have <span className="text-primary-400 font-bold">{uploadedFiles.length + 2}</span> documents pending your signature.
              </p>
              <Button className="w-full bg-primary-600 hover:bg-primary-700 border-none py-6 shadow-lg shadow-primary-500/20">
                Access Chamber
              </Button>
            </CardBody>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-50 px-6 py-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Categories</h3>
            </CardHeader>
            <CardBody className="py-3 px-2">
              <div className="space-y-1">
                {[
                  "Legal Agreements",
                  "Financial Reports",
                  "Pitch Decks",
                  "Board Minutes",
                ].map((category) => (
                  <button key={category} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all">
                    {category}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-gray-50 border-none focus:bg-white transition-all ring-0"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Filter size={16} />} className="h-12 px-6 font-bold">
                    Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                      <th className="px-6 py-4">Document</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Owner</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50/50 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-2xl border-2 ${doc.status === "Signed" ? "bg-green-50 border-green-100 text-green-600" : "bg-blue-50 border-blue-100 text-blue-600"}`}>
                              <FileText size={24} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-tight">{doc.name}</div>
                              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                <span>{doc.size}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <Badge variant="gray">{doc.type}</Badge>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">{getStatusBadge(doc.status)}</td>
                        <td className="px-8 py-6 uppercase font-mono text-[10px] tracking-wider text-gray-700">{doc.owner}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                              onClick={() => setSelectedFile(doc)}
                            >
                              <Eye size={20} />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                              <Download size={20} />
                            </Button>
                            {doc.status === "Draft" && (
                              <Button
                                size="sm"
                                className="h-10 px-4 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                leftIcon={<ArrowUpRight size={16} />}
                                onClick={() => updateDocumentStatus(doc.id, "In Review")}
                              >
                                Submit for Review
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {selectedFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xl animate-fade-in">
          <Card className="w-full max-w-4xl border-none shadow-2xl overflow-hidden rounded-3xl">
            <CardHeader className="bg-white border-b border-gray-100 flex justify-between items-center p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-900 tracking-tight">{selectedFile.name}</h3>
                  <p className="text-sm text-gray-500">{selectedFile.type}  {selectedFile.size}</p>
                </div>
              </div>
              <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </CardHeader>
            <CardBody className="p-0 bg-gray-50">
              <div className="h-96 flex items-center justify-center bg-white m-8 rounded-2xl border border-gray-200">
                <div className="text-center">
                  <FileUp size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">PDF Preview Placeholder</p>
                  <p className="text-sm text-gray-400 mt-1">A document preview would display here.</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {isSigning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xl animate-fade-in">
          <Card className="w-full max-w-xl border-none shadow-2xl overflow-hidden rounded-3xl">
            <CardHeader className="bg-white border-b border-gray-100 flex justify-between items-center p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                  <Signature size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-900 tracking-tight">Electronic Signature</h3>
                  <p className="text-sm text-gray-500">Sign your document securely.</p>
                </div>
              </div>
              <button onClick={() => setIsSigning(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </CardHeader>
            <CardBody className="p-10 space-y-8 bg-white">
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0" size={24} />
                <p className="text-amber-800 text-sm leading-relaxed">
                  By signing this document, you acknowledge that you have read and understood the terms. This signature is legally equivalent to your handwritten signature.
                </p>
              </div>
              <div className="space-y-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Signature Pad</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50 hover:border-primary-300 transition-colors">
                  <div className="text-center">
                    <PenTool size={32} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Signature Area</p>
                    <p className="text-sm text-gray-400 mt-1">Click to draw your signature.</p>
                    <div className="mt-4 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                      <span className="text-gray-300 text-sm">Signature Preview</span>
                    </div>
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="Type your full legal name"
                  value={signedDoc}
                  onChange={(e) => setSignedDoc(e.target.value)}
                  className="w-full bg-white rounded-2xl border border-gray-200 p-4 text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Audit Log ID</span>
                  <span className="font-mono text-xs font-bold text-gray-600">AUTH-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Timestamp</span>
                  <span className="font-mono text-xs font-bold text-gray-600">{new Date().toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1 py-4 border-gray-200" onClick={() => setIsSigning(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
                  disabled={!signedDoc}
                  onClick={handleSignDocument}
                >
                  <CheckCircle size={18} className="mr-2 inline" />
                  Confirm & Finalize Signature
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export { DocumentsPage };
